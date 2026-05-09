import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-zinc-200 dark:border-zinc-800 p-4 hidden md:flex flex-col gap-1">
        <Link href="/dashboard" className="text-lg font-bold mb-4 block">
          Clai
        </Link>
        <Link
          href="/dashboard"
          className="px-3 py-2 rounded-md text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Overview
        </Link>
        <Link
          href="/dashboard/profile"
          className="px-3 py-2 rounded-md text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Profile
        </Link>
        <Link
          href="/dashboard/settings"
          className="px-3 py-2 rounded-md text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Settings
        </Link>
        <Link
          href="/dashboard/letters"
          className="px-3 py-2 rounded-md text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Letters
        </Link>
        <div className="flex-1" />
        <SignOutButton className="w-full px-3 py-2 rounded-md text-sm text-left text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2" />
      </aside>

      <main className="flex-1 p-6">{children}</main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-around p-3">
        <Link href="/dashboard" className="text-xs">Overview</Link>
        <Link href="/dashboard/profile" className="text-xs">Profile</Link>
        <Link href="/dashboard/settings" className="text-xs">Settings</Link>
        <Link href="/dashboard/letters" className="text-xs">Letters</Link>
        <SignOutButton className="text-xs flex items-center gap-1" />
      </nav>
    </div>
  );
}
