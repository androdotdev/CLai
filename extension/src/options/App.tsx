import { useEffect, useState } from "react";
import { LoaderCircle, Check, X } from "lucide-react";

const DEFAULT_URL = "https://c-lai.vercel.app";

type Status = "idle" | "testing" | "success" | "error";

export default function App() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [savedUrl, setSavedUrl] = useState(DEFAULT_URL);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_API_BASE" }, (r) => {
      if (r?.apiBase) {
        setUrl(r.apiBase);
        setSavedUrl(r.apiBase);
      }
    });
  }, []);

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    chrome.runtime.sendMessage({ type: "SET_API_BASE", apiBase: url }, () => {
      setSavedUrl(url);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleTest = async () => {
    setStatus("testing");
    setStatusMsg("");
    const start = performance.now();
    try {
      const res = await fetch(`${url}/api/profile`, { credentials: "include" });
      const ms = Math.round(performance.now() - start);
      if (res.ok) {
        setStatus("success");
        setStatusMsg(`Connected (${ms}ms)`);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setStatusMsg(`${res.status}: ${data.error || res.statusText} (${ms}ms)`);
      }
    } catch {
      setStatus("error");
      setStatusMsg(`Could not reach server (${Math.round(performance.now() - start)}ms)`);
    }
  };

  const handleReset = () => {
    setUrl(DEFAULT_URL);
    chrome.runtime.sendMessage({ type: "SET_API_BASE", apiBase: DEFAULT_URL }, () => {
      setSavedUrl(DEFAULT_URL);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>Clai Options</h1>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
          Server URL
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
            fontSize: "14px",
            background: "transparent",
            color: "inherit",
            fontFamily: "inherit",
          }}
          placeholder="https://c-lai.vercel.app"
        />
        <p style={{ fontSize: "12px", color: "#71717a", marginTop: "4px" }}>
          Your self-hosted server URL. Default: {DEFAULT_URL}
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={handleSave}
          disabled={saving || url === savedUrl}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#09090b",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "13px",
            opacity: saving || url === savedUrl ? 0.5 : 1,
          }}
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
        <button
          onClick={handleTest}
          disabled={status === "testing"}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "1px solid #e4e4e7",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {status === "testing" && <LoaderCircle size={14} className="spinner" />}
          Test Connection
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "1px solid #e4e4e7",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "13px",
          }}
        >
          Reset to Default
        </button>
      </div>

      {status !== "idle" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            background: status === "success" ? "#f0fdf4" : "#fef2f2",
            color: status === "success" ? "#166534" : "#991b1b",
          }}
        >
          {status === "success" ? <Check size={16} /> : <X size={16} />}
          {statusMsg}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
