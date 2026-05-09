const API_BASE = "http://localhost:3000";

interface GeneratePayload {
  jobTitle: string;
  company: string;
  jobDescription: string;
  companyInfo: string;
  provider?: string;
  model?: string;
  length?: string;
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
    message: { type: string; payload: GeneratePayload },
    _sender,
    sendResponse: (response: GenerateResponse) => void
  ) => {
    if (message.type === "GENERATE_LETTER") {
      generateLetter(message.payload).then(sendResponse);
      return true;
    }
  }
);

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
