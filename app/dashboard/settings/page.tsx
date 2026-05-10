"use client";

import { useEffect, useState } from "react";

const modelOptions: Record<string, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1"],
  anthropic: ["claude-sonnet-4-20250514", "claude-haiku-3-5", "claude-opus-4"],
  gemini: ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"],
  openrouter: [
    "openrouter/free",
    "deepseek/deepseek-chat-v3-0324:free",
    "qwen/qwen3-235b-a22b:free",
    "meta-llama/llama-4-maverick:free",
    "google/gemma-3-27b-it:free",
    "google/gemini-2.0-flash-001",
    "openai/gpt-4o-mini",
    "anthropic/claude-sonnet-4",
  ],
};

const keyLabels: Record<string, { label: string; field: string; placeholder: string }> = {
  openai: { label: "OpenAI API Key", field: "openaiKey", placeholder: "sk-..." },
  anthropic: { label: "Anthropic API Key", field: "anthropicKey", placeholder: "sk-ant-..." },
  gemini: { label: "Google AI (Gemini) API Key", field: "geminiKey", placeholder: "AIza..." },
  openrouter: { label: "OpenRouter API Key", field: "openrouterKey", placeholder: "sk-or-v1-..." },
};

const providerLabels: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Google Gemini",
  openrouter: "OpenRouter",
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [preferredProvider, setPreferredProvider] = useState("openai");
  const [model, setModel] = useState("");
  const [hasKeys, setHasKeys] = useState<Record<string, boolean>>({});
  const [providerErrors, setProviderErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((res) => {
        const u = res.user;
        if (u) {
          if (u.name) setName(u.name);
          if (u.preferredProvider) setPreferredProvider(u.preferredProvider);
          if (u.preferredModel) setModel(u.preferredModel);
        }
        if (res.hasKeys) setHasKeys(res.hasKeys);
        if (res.providerErrors) setProviderErrors(res.providerErrors);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const body: Record<string, any> = {
      name,
      preferredProvider,
      preferredModel: model || null,
    };

    for (const key of ["openaiKey", "anthropicKey", "geminiKey", "openrouterKey"]) {
      const val = fd.get(key) as string;
      if (val) body[key] = val;
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.hasKeys) setHasKeys(data.hasKeys);
    if (data.providerErrors) setProviderErrors(data.providerErrors);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemoveKey = async (provider: string) => {
    const field = keyLabels[provider].field;
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: null }),
    });
    const data = await res.json();
    if (data.hasKeys) setHasKeys(data.hasKeys);
    if (data.providerErrors) setProviderErrors(data.providerErrors);
  };

  if (loading) return <div className="text-zinc-500">Loading...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        {(["openai", "anthropic", "gemini", "openrouter"] as const).map((k) => (
          <div key={k}>
            <label className="block text-sm font-medium mb-1">
              {keyLabels[k].label}
              {hasKeys[k] && !providerErrors[k] && (
                <>
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                    Saved ✓
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKey(k)}
                    className="ml-2 text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </>
              )}
              {providerErrors[k] && (
                <span className="ml-2 text-xs text-red-500">
                  Error: {providerErrors[k]}
                </span>
              )}
            </label>
            <input
              name={keyLabels[k].field}
              type="password"
              placeholder={keyLabels[k].placeholder}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">
            Preferred Provider
          </label>
          <select
            value={preferredProvider}
            onChange={(e) => {
              setPreferredProvider(e.target.value);
              setModel("");
            }}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            {(["openai", "anthropic", "gemini", "openrouter"] as const).map((k) => (
              <option key={k} value={k}>
                {providerLabels[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <input
            type="text"
            list="model-suggestions"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Select preset or type any model ID"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <datalist id="model-suggestions">
            {modelOptions[preferredProvider]?.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <p className="text-xs text-zinc-500 mt-1">
            Empty = provider default. Type any model ID for custom models (e.g. {"openrouter/free"}).
          </p>
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
