import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export type AIProvider = "openai" | "anthropic" | "gemini" | "openrouter";

interface GenerateInput {
  provider: AIProvider;
  apiKey: string;
  model: string;
  prompt: string;
  systemPrompt: string;
}

const COVER_LETTER_SYSTEM =
  "You are an expert cover letter writer. Write professional, tailored cover letters that highlight the candidate's relevant experience and skills for the specific job. Keep letters 250-350 words, concise and impactful. Never use generic filler. Match the tone to the company culture hinted in the job description.";

const LENGTH_MAP: Record<string, string> = {
  short: "150-200 words",
  medium: "250-350 words",
  long: "400-500 words",
};

export function buildPrompt(params: {
  userName: string;
  headline: string;
  skills: string[];
  experience: any;
  education: any;
  summary: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  companyInfo: string;
  length?: string;
}): { systemPrompt: string; prompt: string } {
  const experienceText = params.experience
    ? JSON.stringify(params.experience)
    : "No experience listed";
  const educationText = params.education
    ? JSON.stringify(params.education)
    : "No education listed";

  const systemPrompt = `${COVER_LETTER_SYSTEM}

CANDIDATE PROFILE:
Name: ${params.userName}
Headline: ${params.headline}
Skills: ${params.skills.join(", ")}
Experience: ${experienceText}
Education: ${educationText}
Summary: ${params.summary}

Write from this candidate's perspective. Use their actual experience and skills — never invent credentials.`;

  const wordRange = LENGTH_MAP[params.length || "medium"] || "250-350 words";

  const prompt = `Write a cover letter for the following job:

JOB DETAILS:
- Title: ${params.jobTitle}
- Company: ${params.company}
- Description: ${params.jobDescription}
- Company Info: ${params.companyInfo}

Write a tailored, professional cover letter that:
1. Opens with a strong hook referencing the company and role
2. Maps the candidate's specific experience to job requirements using concrete examples
3. Shows knowledge of the company's work or culture
4. Closes with a confident call to action
5. Is ${wordRange}`;

  return { systemPrompt, prompt };
}

export async function generateLetter(
  input: GenerateInput
): Promise<string> {
  const { text } = await generateText({
    model: getModel(input.provider, input.apiKey, input.model),
    system: input.systemPrompt,
    messages: [{ role: "user", content: input.prompt }],
    maxOutputTokens: 2000,
  });
  return text;
}

function getModel(provider: AIProvider, apiKey: string, model: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey })(model || "gpt-4o-mini");
    case "anthropic":
      return createAnthropic({ apiKey })(model || "claude-sonnet-4-20250514");
    case "gemini":
      return createGoogleGenerativeAI({ apiKey })(model || "gemini-2.0-flash");
    case "openrouter":
      return createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      })(model || "google/gemini-2.0-flash-001");
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
