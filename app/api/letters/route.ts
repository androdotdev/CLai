import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { db } from "@/db";
import { coverLetter } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const letters = await db
    .select()
    .from(coverLetter)
    .where(eq(coverLetter.userId, session.user.id))
    .orderBy(desc(coverLetter.createdAt));

  return Response.json({ data: letters });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { jobTitle, company, jobDescription, companyInfo, content } = body;

  if (!jobTitle || !company || !content) {
    return Response.json({ error: "jobTitle, company, and content required" }, { status: 400 });
  }

  await db.insert(coverLetter).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    jobTitle,
    company,
    jobUrl: null,
    jobDescription,
    companyInfo,
    content,
    provider: null,
    model: null,
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  await db
    .delete(coverLetter)
    .where(
      and(eq(coverLetter.id, id), eq(coverLetter.userId, session.user.id))
    );

  return Response.json({ ok: true });
}
