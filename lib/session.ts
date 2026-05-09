import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  const authHeaders = await headers();
  const session = await auth.api.getSession({ headers: authHeaders });
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
