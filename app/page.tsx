import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xl font-bold">Clai</span>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl">
          AI cover letters that{" "}
          <span className="text-blue-600 dark:text-blue-400">actually work</span>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl">
          Paste a job link. Clai reads the description and company info, then
          writes a tailored cover letter using your profile and your own AI key.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium hover:opacity-90"
          >
            Start writing — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl text-left">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Add your API key</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Bring your own OpenAI, Anthropic, or Google key. Your data, your
              cost.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">2. Set up your profile</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Add your skills, experience, and education so every letter is
              personalized.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">3. Browse and generate</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Use the Chrome extension to generate cover letters on any job
              site.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
        Clai — AI Cover Letters
      </footer>
    </div>
  );
}
