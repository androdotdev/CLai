# Clai

AI-powered cover letter generator. Web app (Next.js) + Chrome extension.

**Tech Stack:** Next.js 16.2.6 App Router · TypeScript · Tailwind v4 · Drizzle ORM · Neon Postgres · Better Auth · Vercel AI SDK

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your values
npx drizzle-kit push    # sync DB schema
npm run dev             # → http://localhost:3000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `BETTER_AUTH_SECRET` | Auth secret (generate with `openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | `http://localhost:3000` (dev) or your Vercel URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Same as above |

## Chrome Extension

### Download & Install
1. Go to the [Releases page](https://github.com/androdotdev/CLai/releases)
2. Download `clai-extension.zip`
3. Unzip it
4. Go to `chrome://extensions`, enable **Developer mode**
5. Click **Load unpacked** and select the unzipped folder

### For normal users (zero config)
The extension works out of the box pointing at the hosted service. Just install and use.

### For self-hosters
1. Install the extension
2. Right-click the extension icon → **Options**
3. Enter your custom server URL
4. Click **Test Connection** to verify
5. Click **Save**

### Load in Chrome (development)
1. `cd extension && npm install && npm run build`
2. Go to `chrome://extensions`, enable Developer mode
3. Click "Load unpacked", select `extension/dist/`

### Build for Store
```bash
cd extension && npm run build
cd dist && zip -r ../clai-extension.zip .
```

## Deploy on Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Set env vars (including `BETTER_AUTH_SECRET`)
4. Deploy

For extension to work in production:
- Set `NODE_ENV=production` for `SameSite: none` cookies
- Use HTTPS URL for `BETTER_AUTH_URL`

## Features

- Multi-provider AI (OpenAI, Anthropic, Gemini, OpenRouter) with auto-fallback
- Bring your own API key — stored encrypted
- Chrome extension scrapes LinkedIn, Wellfound, and generic job pages
- Editable cover letters with short/medium/long length control
- One-click copy and auto-fill into job application forms
- Cover letter history
