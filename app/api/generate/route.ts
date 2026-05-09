import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { db } from "@/db";
import { user, coverLetter } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { generateLetter, buildPrompt } from "@/lib/ai";

type UserRecord = {
  id: string;
  openaiKey: string | null;
  anthropicKey: string | null;
  geminiKey: string | null;
  openrouterKey: string | null;
  preferredProvider: string | null;
  preferredModel: string | null;
  providerErrors: Record<string, string> | null;
  [key: string]: any;
};

async function saveProviderError(userId: string, provider: string, message: string) {
  const record = await db.select().from(user).where(eq(user.id, userId)).then((r) => r[0]);
  const errors = (record?.providerErrors as Record<string, string>) || {};
  errors[provider] = message;
  await db.update(user).set({ providerErrors: errors }).where(eq(user.id, userId));
}

async function clearProviderError(userId: string, provider: string) {
  const record = await db.select().from(user).where(eq(user.id, userId)).then((r) => r[0]);
  const errors = (record?.providerErrors as Record<string, string>) || {};
  delete errors[provider];
  await db.update(user).set({ providerErrors: errors }).where(eq(user.id, userId));
}

async function generateWithFallback(
  userRecord: UserRecord,
  requestedProvider: string | undefined,
  requestedModel: string | undefined,
  systemPrompt: string,
  prompt: string
): Promise<{ content: string; provider: string; model: string }> {
  const providers: Array<{ key: string; field: keyof UserRecord; defaultModel: string }> = [
    { key: "openai", field: "openaiKey", defaultModel: "gpt-4o-mini" },
    { key: "anthropic", field: "anthropicKey", defaultModel: "claude-sonnet-4-20250514" },
    { key: "gemini", field: "geminiKey", defaultModel: "gemini-2.0-flash" },
    { key: "openrouter", field: "openrouterKey", defaultModel: "google/gemini-2.0-flash-001" },
  ];

  const preferred = requestedProvider || userRecord.preferredProvider || "openai";
  const preferredIdx = providers.findIndex((p) => p.key === preferred);
  const ordered = preferredIdx >= 0
    ? [...providers.slice(preferredIdx), ...providers.slice(0, preferredIdx)]
    : providers;

  const failures: string[] = [];

  for (const p of ordered) {
    if (!userRecord[p.field]) continue;

    const apiKey = await decrypt(userRecord[p.field]!);
    const model = p.key === preferred && requestedModel ? requestedModel : p.defaultModel;

    try {
      const content = await generateLetter({
        provider: p.key as any,
        apiKey,
        model,
        systemPrompt,
        prompt,
      });
      await clearProviderError(userRecord.id, p.key);
      return { content, provider: p.key, model };
    } catch (err: any) {
      const message = err?.message || "Unknown error";
      failures.push(`${p.key}: ${message}`);
      await saveProviderError(userRecord.id, p.key, message);
    }
  }

  throw new Error(
    `All providers failed.\n${failures.join("\n")}\n\nCheck Settings for details.`
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    let { jobTitle, company, jobDescription, companyInfo, provider, model, length } = body as Record<string, any>;

    if (!company && jobTitle?.includes(" at ")) {
      const parts = jobTitle.split(" at ");
      jobTitle = parts.slice(0, -1).join(" at ").trim();
      company = parts[parts.length - 1].trim();
    }

    if (!jobTitle || !company) {
      return Response.json(
        { error: `Could not detect job details on this page. Try navigating to the job description.` },
        { status: 400 }
      );
    }

    const userRecord = (await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .then((r) => r[0])) as UserRecord | undefined;

    if (!userRecord) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const { systemPrompt, prompt } = buildPrompt({
      userName: userRecord.name || "Applicant",
      headline: userRecord.headline || "Professional",
      skills: (userRecord.skills || []) as string[],
      experience: userRecord.experience,
      education: userRecord.education,
      summary: userRecord.summary || "",
      jobTitle,
      company,
      jobDescription: jobDescription || "",
      companyInfo: companyInfo || "",
      length,
    });

    const { content, provider: usedProvider, model: usedModel } = await generateWithFallback(
      userRecord,
      provider,
      model,
      systemPrompt,
      prompt
    );

    await db.insert(coverLetter).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      jobTitle,
      company,
      jobUrl: null,
      jobDescription,
      companyInfo,
      content,
      provider: usedProvider,
      model: usedModel || null,
    });

    return Response.json({ content });
  } catch (err: any) {
    console.error("Generate error:", err?.message, err?.stack);
    return Response.json(
      { error: err.message || "Generation failed" },
      { status: 500 }
    );
  }
}
