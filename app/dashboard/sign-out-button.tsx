"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await authClient.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      {loading && <LoaderCircle size={14} className="animate-spin" />}
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
