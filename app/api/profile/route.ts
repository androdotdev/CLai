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

  if (body.openaiKey !== undefined) {
    updateData.openaiKey = body.openaiKey ? await encrypt(body.openaiKey) : null;
  }
  if (body.anthropicKey !== undefined) {
    updateData.anthropicKey = body.anthropicKey ? await encrypt(body.anthropicKey) : null;
  }
  if (body.geminiKey !== undefined) {
    updateData.geminiKey = body.geminiKey ? await encrypt(body.geminiKey) : null;
  }
  if (body.openrouterKey !== undefined) {
    updateData.openrouterKey = body.openrouterKey ? await encrypt(body.openrouterKey) : null;
  }

  // Clear provider errors for providers that got new keys or had keys removed
  if (body.openaiKey !== undefined || body.anthropicKey !== undefined || body.geminiKey !== undefined || body.openrouterKey !== undefined) {
    const record = await db.select().from(user).where(eq(user.id, session.user.id)).then((r) => r[0]);
    const errors = (record?.providerErrors as Record<string, string>) || {};
    if (body.openaiKey !== undefined) delete errors.openai;
    if (body.anthropicKey !== undefined) delete errors.anthropic;
    if (body.geminiKey !== undefined) delete errors.gemini;
    if (body.openrouterKey !== undefined) delete errors.openrouter;
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
