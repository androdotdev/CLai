<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Structure

- Flattened structure (no `src/`) — `app/`, `db/`, `lib/` at root
- Next.js 16.2.6 App Router + TypeScript + Tailwind v4
- Better Auth for authentication (email/password only)
- Drizzle ORM + Neon Postgres
- Vercel AI SDK for multi-provider AI (OpenAI, Anthropic, Gemini, OpenRouter)

## Key Conventions

- All API routes in `app/api/` — `generate/`, `profile/`, `letters/`
- Dashboard pages in `app/dashboard/` — `profile/`, `settings/`, `letters/`
- Auth pages in `app/(auth)/` — `login/`, `signup/`
- Auth client in `lib/auth-client.ts` (use for client-side auth calls)
- Auth server in `lib/auth-server.ts` (re-exports `auth` instance)
- DB schema in `db/schema.ts` — run `npx drizzle-kit push` to sync
- Encryption in `lib/encryption.ts` for API key storage

## Extension

- Chrome extension in `extension/` — MV3, React popup, content script with per-site scrapers
- Background service worker in `extension/src/background/index.ts`
- Content script in `extension/src/content/index.ts`
- Scrapers in `extension/src/content/scrapers/`
- Popup UI in `extension/src/popup/App.tsx`
- `API_BASE` in background hardcoded to `localhost:3000` — update for production
- Build: `npm run build` in `extension/`, outputs to `extension/dist/`
- Load unpacked from `extension/dist/`

## Important Gotchas

- Cookie `SameSite` uses `"none"` in production (HTTPS), `"lax"` in dev (HTTP)
- Extension uses cookies for auth — works in production with HTTPS + SameSite none
- Provider errors stored in `user.providerErrors` JSONB column
- Fallback: generate route tries all providers in order, stores errors, skips to next on any failure
- `providerErrors` displayed in Settings page per-provider
