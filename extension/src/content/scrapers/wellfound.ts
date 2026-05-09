import type { SiteScraper } from "./types";

export const wellfoundScraper: SiteScraper = {
  hostnames: ["wellfound.com", "www.wellfound.com", "angel.co", "www.angel.co"],
  scrape() {
    const descEl = document.querySelector<HTMLElement>(
      "[data-test='job-description']"
    ) || document.querySelector<HTMLElement>(".description");

    const titleEl =
      document.querySelector<HTMLElement>("[data-test='job-title']") ||
      document.querySelector<HTMLElement>("h1");

    const companyEl =
      document.querySelector<HTMLElement>("[data-test='company-name']") ||
      document.querySelector<HTMLElement>(".company-name");

    const companyInfoEl = document.querySelector<HTMLElement>(
      "[data-test='company-details']"
    );

    return {
      jobTitle: titleEl?.innerText?.trim() || "",
      company: companyEl?.innerText?.trim() || "",
      jobDescription: descEl?.innerText?.trim() || "",
      companyInfo: companyInfoEl?.innerText?.trim() || "",
    };
  },
};
