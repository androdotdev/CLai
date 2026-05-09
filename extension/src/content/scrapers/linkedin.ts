import type { SiteScraper } from "./types";

export const linkedinScraper: SiteScraper = {
  hostnames: ["www.linkedin.com", "linkedin.com"],
  scrape() {
    const descEl =
      document.querySelector<HTMLElement>(
        ".jobs-description-content__text"
      ) ||
      document.querySelector<HTMLElement>(".job-view-layout") ||
      document.querySelector<HTMLElement>("[data-job-description]") ||
      document.querySelector<HTMLElement>(".jobs-box__body");

    const titleEl =
      document.querySelector<HTMLElement>(".job-details-jobs-header__job-title") ||
      document.querySelector<HTMLElement>("h1") ||
      document.querySelector<HTMLElement>("[data-job-title]") ||
      document.querySelector<HTMLElement>(".job-title");

    const companyEl =
      document.querySelector<HTMLElement>(".job-details-jobs-header__company-info a") ||
      document.querySelector<HTMLElement>(".job-details-jobs-header__company-name") ||
      document.querySelector<HTMLElement>(".job-details-jobs-header__company-info") ||
      document.querySelector<HTMLElement>("[data-company-name]") ||
      document.querySelector<HTMLElement>(".company-name");

    let jobTitle = titleEl?.innerText?.trim() || "";
    let company = companyEl?.innerText?.trim() || "";

    if (!jobTitle) {
      const ogTitle = document.querySelector<HTMLMetaElement>("meta[property='og:title']");
      if (ogTitle?.content) {
        const parts = ogTitle.content.split(/[-–—|·]/);
        jobTitle = parts[0]?.trim() || "";
        if (!company && parts.length > 1) company = parts[parts.length - 1]?.trim() || "";
      }
    }

    if (!jobTitle) jobTitle = document.title.split(/[-–—|·]/)[0]?.trim() || "";
    if (!company) company = document.title.split(/[-–—|·]/).pop()?.trim() || "";

    const parsed = parseAtFallback(jobTitle, company);
    return {
      jobTitle: parsed.jobTitle,
      company: parsed.company,
      jobDescription: descEl?.innerText?.trim() || "",
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
