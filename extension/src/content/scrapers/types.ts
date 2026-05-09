export interface ScraperResult {
  jobTitle: string;
  company: string;
  jobDescription: string;
  companyInfo: string;
}

export interface SiteScraper {
  hostnames: string[];
  scrape: () => ScraperResult | null;
}
