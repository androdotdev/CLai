import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export function getUserById(id: string) {
  return db.select().from(user).where(eq(user.id, id)).then((r) => r[0] ?? null);
}

export function updateUser(id: string, data: Partial<typeof user.$inferInsert>) {
  return db.update(user).set(data).where(eq(user.id, id)).returning();
}
