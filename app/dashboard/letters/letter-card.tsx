"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Trash2, LoaderCircle, ChevronDown, ChevronUp } from "lucide-react";

interface LetterCardProps {
  id: string;
  jobTitle: string;
  company: string;
  content: string;
  createdAt: string;
  provider: string | null;
}

export default function LetterCard({ id, jobTitle, company, content, createdAt, provider }: LetterCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/letters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setDeleted(true);
        router.refresh();
      }
    } catch {
      setDeleting(false);
    }
  };

  if (deleted) return null;

  return (
    <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-start justify-between mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 min-w-0 text-left cursor-pointer"
        >
          <h2 className="font-semibold truncate">
            {jobTitle} at {company}
          </h2>
          <p className="text-xs text-zinc-500">
            {createdAt}
            {provider && ` · ${provider}`}
          </p>
        </button>
        <div className="flex items-center gap-0.5 ml-2 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Copy"
          >
            {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Delete"
          >
            {deleting ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <p
        className={`text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {content}
      </p>
    </div>
  );
}