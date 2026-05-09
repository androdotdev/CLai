import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/encryption";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const record = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .then((r) => r[0]);

  if (!record) return Response.json({ error: "User not found" }, { status: 404 });

  const { openaiKey, anthropicKey, geminiKey, openrouterKey, providerErrors, ...safe } = record;
  return Response.json({
    user: safe,
    hasKeys: {
      openai: !!openaiKey,
      anthropic: !!anthropicKey,
      gemini: !!geminiKey,
      openrouter: !!openrouterKey,
    },
    providerErrors: providerErrors || {},
  });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const updateData: Record<string, any> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.headline !== undefined) updateData.headline = body.headline;
  if (body.summary !== undefined) updateData.summary = body.summary;
  if (body.skills !== undefined) updateData.skills = body.skills;
  if (body.preferredProvider !== undefined) updateData.preferredProvider = body.preferredProvider;
  if (body.preferredModel !== undefined) updateData.preferredModel = body.preferredModel;

  if (body.openaiKey) updateData.openaiKey = await encrypt(body.openaiKey);
  if (body.anthropicKey) updateData.anthropicKey = await encrypt(body.anthropicKey);
  if (body.geminiKey) updateData.geminiKey = await encrypt(body.geminiKey);
  if (body.openrouterKey) updateData.openrouterKey = await encrypt(body.openrouterKey);

  // Clear provider errors for providers that just got new keys
  if (body.openaiKey || body.anthropicKey || body.geminiKey || body.openrouterKey) {
    const record = await db.select().from(user).where(eq(user.id, session.user.id)).then((r) => r[0]);
    const errors = (record?.providerErrors as Record<string, string>) || {};
    if (body.openaiKey) delete errors.openai;
    if (body.anthropicKey) delete errors.anthropic;
    if (body.geminiKey) delete errors.gemini;
    if (body.openrouterKey) delete errors.openrouter;
    updateData.providerErrors = errors;
  }

  await db.update(user).set(updateData).where(eq(user.id, session.user.id));

  const updated = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .then((r) => r[0]);

  return Response.json({
    ok: true,
    hasKeys: {
      openai: !!updated?.openaiKey,
      anthropic: !!updated?.anthropicKey,
      gemini: !!updated?.geminiKey,
      openrouter: !!updated?.openrouterKey,
    },
    providerErrors: (updated?.providerErrors as Record<string, string>) || {},
  });
}
