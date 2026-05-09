import type { SiteScraper } from "./types";

export const genericScraper: SiteScraper = {
  hostnames: [],
  scrape() {
    const titleEl =
      document.querySelector<HTMLElement>("h1") ||
      document.querySelector<HTMLElement>("h2");

    const mainEl =
      document.querySelector<HTMLElement>("main") ||
      document.querySelector<HTMLElement>("article") ||
      document.querySelector<HTMLElement>("[role='main']");

    const allText = mainEl?.innerText?.trim() || document.body?.innerText?.trim() || "";

    const ogTitle = document.querySelector<HTMLMetaElement>("meta[property='og:title']");
    const ogSite = document.querySelector<HTMLMetaElement>("meta[property='og:site_name']");

    let jobTitle = titleEl?.innerText?.trim() || "";
    if (!jobTitle && ogTitle?.content) {
      const parts = ogTitle.content.split(/[-–—|·]/);
      jobTitle = parts[0]?.trim() || "";
    }
    if (!jobTitle) {
      jobTitle = document.title.split(/[-–—|·]/)[0]?.trim() || "Unknown Position";
    }

    let company = "";
    const companySelectors = [
      "[class*='company-name']",
      "[class*='company']",
      "[data-testid*='company']",
      "[data-test='company-name']",
      ".employer",
      ".org-name",
    ];
    for (const sel of companySelectors) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el?.innerText?.trim()) {
        company = el.innerText.trim();
        break;
      }
    }
    if (!company) company = extractCompanyName();
    if (!company) company = "Unknown Company";

    const parsed = parseAtFallback(jobTitle, company);
    return {
      jobTitle: parsed.jobTitle,
      company: parsed.company,
      jobDescription: allText.slice(0, 5000),
      companyInfo: "",
    };
  },
};

function parseAtFallback(title: string, c: string) {
  if (!c && title.includes(" at ")) {
    const parts = title.split(" at ");
    return {
      jobTitle: parts.slice(0, -1).join(" at ").trim(),
      company: parts[parts.length - 1].trim(),
    };
  }
  return { jobTitle: title, company: c };
}

function extractCompanyName(): string {
  const meta = document.querySelector<HTMLMetaElement>("meta[property='og:site_name']");
  if (meta?.content) return meta.content;

  const ogTitle = document.querySelector<HTMLMetaElement>("meta[property='og:title']");
  if (ogTitle?.content) {
    const parts = ogTitle.content.split(/[-–—|·]/);
    return parts[parts.length - 1]?.trim() || "";
  }

  return document.title.split(/[-–—|·]/).pop()?.trim() || "";
}
