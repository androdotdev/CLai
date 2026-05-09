import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { db } from "@/db";
import { coverLetter } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import LetterCard from "./letter-card";

export default async function LettersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const letters = await db
    .select()
    .from(coverLetter)
    .where(eq(coverLetter.userId, session.user.id))
    .orderBy(desc(coverLetter.createdAt));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Cover Letters</h1>

      {letters.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400">
          No cover letters yet. Use the Chrome extension to generate one.
        </p>
      )}

      <div className="space-y-4">
        {letters.map((letter) => (
          <LetterCard
            key={letter.id}
            id={letter.id}
            jobTitle={letter.jobTitle}
            company={letter.company}
            content={letter.content}
            createdAt={letter.createdAt.toLocaleDateString()}
            provider={letter.provider}
          />
        ))}
      </div>
    </div>
  );
}
