"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await authClient.signUp.email({ name, email, password });
    setLoading(false);
    if (err) {
      setError(err.message || err.statusText || "Signup failed");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-6 py-24">
      <h1 className="text-2xl font-bold mb-8 text-center">Create account</h1>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <LoaderCircle size={16} className="animate-spin" />}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-500">
        <span>Already have an account? </span>
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
