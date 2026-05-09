import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        Set up your profile and start generating cover letters.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/profile"
          className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
        >
          <h2 className="font-semibold mb-1">Profile</h2>
          <p className="text-sm text-zinc-500">
            Add your skills, experience, and education.
          </p>
        </Link>

        <Link
          href="/dashboard/settings"
          className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
        >
          <h2 className="font-semibold mb-1">Settings</h2>
          <p className="text-sm text-zinc-500">
            Configure your AI provider and API keys.
          </p>
        </Link>

        <Link
          href="/dashboard/letters"
          className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
        >
          <h2 className="font-semibold mb-1">Letters</h2>
          <p className="text-sm text-zinc-500">
            View your generated cover letter history.
          </p>
        </Link>

        <div className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold mb-1">Chrome Extension</h2>
          <p className="text-sm text-zinc-500">
            Install the extension to generate letters on job sites.
          </p>
        </div>
      </div>
    </div>
  );
}
