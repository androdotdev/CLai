import { linkedinScraper } from "./scrapers/linkedin";
import { wellfoundScraper } from "./scrapers/wellfound";
import { genericScraper } from "./scrapers/generic";
import type { ScraperResult, SiteScraper } from "./scrapers/types";

const scrapers: SiteScraper[] = [
  linkedinScraper,
  wellfoundScraper,
  genericScraper,
];

function getScraper(): SiteScraper {
  const hostname = window.location.hostname.toLowerCase();
  for (const scraper of scrapers) {
    if (
      scraper.hostnames.length === 0 ||
      scraper.hostnames.some((h) => hostname.includes(h))
    ) {
      return scraper;
    }
  }
  return genericScraper;
}

function scrapePage(): ScraperResult | null {
  try {
    const scraper = getScraper();
    return scraper.scrape();
  } catch {
    return null;
  }
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener(
  (message: any, _sender, sendResponse) => {
    if (message.type === "SCRAPE_JOB") {
      const result = scrapePage();

      // Also scan iframes for job content
      const iframes = document.querySelectorAll("iframe");
      if (iframes.length > 0) {
        for (const iframe of iframes) {
          try {
            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const text = iframeDoc.body?.innerText || "";
              if (text.length > 200 && result) {
                result.jobDescription += "\n\n" + text.slice(0, 3000);
              }
            }
          } catch {
            // cross-origin iframe, skip
          }
        }
      }

      sendResponse(result);
    }

    if (message.type === "AUTOFILL" && message.content) {
      autoFill(message.content);
      sendResponse({ ok: true });
    }
    return true; // keep channel open for async response
  }
);

function autoFill(content: string) {
  // Try to find a cover letter textarea or contenteditable
  const selectors = [
    "textarea[data-clai-cover]",
    "textarea#cover-letter",
    "textarea[name='cover_letter']",
    "textarea[placeholder*='cover']",
    "textarea[placeholder*='Cover']",
    'div[contenteditable="true"]',
    // Generic: largest textarea on the page
    "textarea",
  ];

  for (const sel of selectors) {
    const el = document.querySelector<HTMLTextAreaElement | HTMLElement>(sel);
    if (el) {
      if (el instanceof HTMLTextAreaElement) {
        el.value = content;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (el.contentEditable === "true") {
        el.innerText = content;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      break;
    }
  }
}
