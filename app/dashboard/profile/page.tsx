"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((res) => {
        const u = res.user;
        if (u) {
          if (u.headline) setHeadline(u.headline);
          if (u.summary) setSummary(u.summary);
          if (u.skills) setSkills(Array.isArray(u.skills) ? u.skills.join(", ") : "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const skillsArr = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline, summary, skills: skillsArr }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-zinc-500">Loading...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Full-Stack Software Engineer"
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short bio / professional summary"
            rows={3}
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Skills</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, Python, TypeScript, ..."
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <p className="text-xs text-zinc-500 mt-1">Comma-separated</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      </form>
    </div>
  );
}
