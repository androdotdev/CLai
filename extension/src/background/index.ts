const DEFAULT_API_BASE = "https://c-lai.vercel.app";
let API_BASE = DEFAULT_API_BASE;

chrome.storage.sync.get(["apiBase"]).then((r) => {
  if (r.apiBase) API_BASE = r.apiBase;
});

interface GeneratePayload {
  jobTitle: string;
  company: string;
  jobDescription: string;
  companyInfo: string;
  provider?: string;
  model?: string;
  length?: string;
}

interface SavePayload {
  jobTitle: string;
  company: string;
  jobDescription?: string;
  companyInfo?: string;
  content: string;
}

interface SuccessResponse {
  content: string;
}

interface ErrorResponse {
  error: string;
}

type GenerateResponse = SuccessResponse | ErrorResponse;

chrome.runtime.onMessage.addListener(
  (
    message: any,
    _sender,
    sendResponse: (response: any) => void
  ) => {
    if (message.type === "GENERATE_LETTER") {
      generateLetter(message.payload).then(sendResponse);
      return true;
    }
    if (message.type === "GET_API_BASE") {
      sendResponse({ apiBase: API_BASE });
      return true;
    }
    if (message.type === "SET_API_BASE") {
      API_BASE = message.apiBase;
      chrome.storage.sync.set({ apiBase: message.apiBase });
      sendResponse({ ok: true });
      return true;
    }
    if (message.type === "SAVE_LETTER") {
      saveLetter(message.payload).then(sendResponse);
      return true;
    }

  }
);

async function saveLetter(payload: SavePayload): Promise<{ ok?: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/letters`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Save failed" };
    }

    return { ok: true };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

async function generateLetter(
  payload: GeneratePayload
): Promise<GenerateResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Request failed" };
    }

    const data = await res.json();
    return { content: data.content };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}
