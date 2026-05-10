import { useState, useEffect } from "react";
import { LoaderCircle, Copy, Check, Sparkles, SaveIcon } from "lucide-react";
import type { ScraperResult } from "../content/scrapers/types";

type Step = "idle" | "scraping" | "generating" | "done" | "error";
type Length = "short" | "medium" | "long";

interface GenerateResponse {
  content?: string;
  error?: string;
}

const LENGTH_LABELS: Record<Length, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
};

const styles = `
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 1s linear infinite; }
`;

export default function App() {
  const [step, setStep] = useState<Step>("idle");
  const [data, setData] = useState<ScraperResult | null>(null);
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [length, setLength] = useState<Length>("medium");
  const [apiBase, setApiBase] = useState("https://c-lai.vercel.app");
  const [updateAvailable, setUpdateAvailable] = useState<string | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_API_BASE" }, (r) => {
      if (r?.apiBase) setApiBase(r.apiBase);
    });
    fetch("https://api.github.com/repos/androdotdev/CLai/releases/latest")
      .then((r) => r.json())
      .then((data) => {
        const latest = (data.tag_name || "").replace(/^v/, "");
        const current = chrome.runtime.getManifest().version;
        if (latest && latest !== current) setUpdateAvailable(latest);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async (selectedLength?: Length) => {
    const len = selectedLength || length;
    setStep("scraping");
    setError("");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setError("No active tab found");
      setStep("error");
      return;
    }

    let result: ScraperResult | null = null;
    try {
      result = await chrome.tabs.sendMessage(
        tab.id,
        { type: "SCRAPE_JOB" }
      ) as ScraperResult | null;
    } catch {
      setError("Error occur: check dashboard for more info");
      setStep("error");
      return;
    }

    if (!result || (!result.jobTitle && !result.jobDescription)) {
      setError("Could not detect job details on this page.");
      setStep("error");
      return;
    }

    setData(result);
    setStep("generating");

    const response = await chrome.runtime.sendMessage({
      type: "GENERATE_LETTER",
      payload: { ...result, length: len },
    }) as GenerateResponse | undefined;

    if (response?.error) {
      setError(response.error);
      setStep("error");
    } else if (response?.content) {
      setLetter(response.content);
      setStep("done");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoFill = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    await chrome.tabs.sendMessage(tab.id, {
      type: "AUTOFILL",
      content: letter,
    });
    window.close();
  };

  const handleSave = async () => {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_LETTER",
      payload: { ...data, content: letter },
    }) as { ok?: boolean; error?: string } | undefined;

    if (response?.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const openSettings = () => {
    chrome.tabs.create({ url: `${apiBase}/dashboard/settings` });
  };

  return (
    <div style={{ padding: "16px" }}>
      <style>{styles}</style>
      {updateAvailable && (
        <a
          href="https://github.com/androdotdev/CLai/releases"
          target="_blank"
          style={{
            display: "block",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#fef3c7",
            color: "#92400e",
            fontSize: "12px",
            fontWeight: 500,
            textDecoration: "none",
            marginBottom: "12px",
          }}
        >
          Update v{updateAvailable} available — download now
        </a>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ fontSize: "18px", fontWeight: 700 }}>Clai</span>
        {data && (
          <span style={{ fontSize: "12px", color: "#71717a" }}>
            {data.jobTitle} @ {data.company}
          </span>
        )}
      </div>

      {(step === "scraping" || step === "generating") && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#71717a" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <LoaderCircle size={24} className="spinner" />
          </div>
          {step === "scraping" ? "Reading job page..." : "Writing your cover letter..."}
        </div>
      )}

      {step === "done" && (
        <>
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            style={{
              width: "100%",
              height: "300px",
              padding: "12px",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              fontSize: "13px",
              lineHeight: 1.5,
              resize: "vertical",
              background: "transparent",
              color: "inherit",
              fontFamily: "inherit",
            }}
          />

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {saved ? <Check size={16} /> : <SaveIcon size={16} />}
              {saved ? "Saved!" : "Save"}
            </button>
            <button
              onClick={handleAutoFill}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#09090b",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Auto-fill
            </button>
          </div>

          <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
            {(Object.keys(LENGTH_LABELS) as Length[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLength(l);
                  handleGenerate(l);
                }}
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e4e4e7",
                  background: length === l ? "#09090b" : "transparent",
                  color: length === l ? "#fff" : "inherit",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "12px",
                }}
              >
                {LENGTH_LABELS[l]}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleGenerate()}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Regenerate
          </button>
        </>
      )}

      {step === "error" && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ color: "#ef4444", marginBottom: "12px", fontSize: "13px", lineHeight: 1.4 }}>{error}</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <button
              onClick={() => handleGenerate()}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Try again
            </button>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openSettings();
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              Check Settings
            </a>
          </div>
        </div>
      )}

      {step === "idle" && (
        <div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
            {(Object.keys(LENGTH_LABELS) as Length[]).map((l) => (
              <button
                key={l}
                onClick={() => setLength(l)}
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e4e4e7",
                  background: length === l ? "#09090b" : "transparent",
                  color: length === l ? "#fff" : "inherit",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "12px",
                }}
              >
                {LENGTH_LABELS[l]}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleGenerate()}
            style={{
              width: "100%",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#09090b",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={16} />
            Generate Cover Letter
          </button>
        </div>
      )}

      <div style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", color: "#a1a1aa" }}>
        {data?.company && `Detected: ${data.company} · `}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openSettings();
          }}
          style={{ color: "#a1a1aa" }}
        >
          Settings
        </a>
      </div>
    </div>
  );
}
