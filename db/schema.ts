import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Better Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  headline: text("headline"),
  summary: text("summary"),
  skills: text("skills").array(),
  experience: jsonb("experience"),
  education: jsonb("education"),
  openaiKey: text("openai_key"),
  anthropicKey: text("anthropic_key"),
  geminiKey: text("gemini_key"),
  openrouterKey: text("openrouter_key"),
  preferredProvider: text("preferred_provider"),
  preferredModel: text("preferred_model"),
  providerErrors: jsonb("provider_errors").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Application tables
export const coverLetter = pgTable("cover_letter", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  jobUrl: text("job_url"),
  jobDescription: text("job_description"),
  companyInfo: text("company_info"),
  content: text("content").notNull(),
  provider: text("provider"),
  model: text("model"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
