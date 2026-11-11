# Art Through You

An interactive, five-chapter journey through the evolution of art. Visitors make choices, carry symbols and themes between eras, and finish with a personal chronological gallery.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The app works in **Demo Mode** without API keys. Progress is stored in the browser's local storage.

## AI setup

The app uses Gemini for text and Cloudflare Workers AI for images.

Add these server-side keys to `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_workers_ai_api_token
```

- **Gemini** writes personalised chapters and adaptive reflection questions.
- **Cloudflare Workers AI FLUX.1 schnell** generates era artwork. The Workers AI Free plan includes 10,000 Neurons per day; usage beyond the free allocation requires a paid Workers plan.
- **Cloudflare Stable Diffusion 1.5 img2img** creates the four-timeline portrait sheet from the uploaded portrait. This model is currently listed as beta and at $0.00 per step; availability and limits can change. Its identity preservation is less reliable than the former Gemini image model.

To create Cloudflare credentials, open **AI > Workers AI > Use REST API** in the Cloudflare dashboard, select **Create a Workers AI API Token**, and copy the Account ID. If creating a token manually, grant **Workers AI - Read** and **Workers AI - Edit** permissions. Add both values to Vercel under Project Settings > Environment Variables (Production, Preview and Development), then redeploy.

Never put secret keys in `NEXT_PUBLIC_` variables or commit `.env.local`.

## Persistence

The initial MVP persists the complete journey in browser local storage, which makes the demo easy to run without infrastructure. The Supabase migration in `supabase/migrations/001_initial.sql` defines the remote schema for the next integration step. Before enabling remote persistence, add per-journey ownership, appropriate Row Level Security policies and server-side writes. The service-role key must remain server-only.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, select **Add New → Project** and import `Chimpfreak/ArtThroughYou`.
3. Keep the framework preset as Next.js and the root directory as `.`.
4. Add `GEMINI_API_KEY`, `GEMINI_MODEL`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_API_TOKEN` as environment variables.
5. Deploy. Demo Mode works without these keys.

A GitHub push does not itself publish a Next.js app. Vercel must be connected and the deployment must complete successfully.

## Project structure

```text
src/app/                 Next.js pages and API routes
src/app/api/story/       Gemini narrative endpoint
src/app/api/question/    Gemini adaptive-question endpoint
src/app/api/timelines/   Cloudflare identity-guided image endpoint
src/lib/gemini.ts        Shared Gemini text API helper
src/lib/cloudflare-ai.ts Shared Cloudflare Workers AI image helper
src/app/api/artwork/     Cloudflare FLUX image-generation endpoint
src/lib/eras.ts          Curated era configuration and historical notes
src/lib/types.ts         Journey and memory types
supabase/migrations/     Initial database schema
```

## Current MVP scope

- Five fixed historical eras and curated historical context.
- Six distinct choices per chapter, with varied ordering.
- Persistent journey state and evolving symbol/theme memory.
- Gemini-generated adaptive questions and personalised stories.
- Cloudflare-generated era artwork and four parallel-life portrait sheet, with curated demo fallbacks when image services are not configured.
- Final chronological gallery and print stylesheet.
- Local browser persistence and AI API endpoints.

## Historical note

The narrative is fictional. Historical context is presented separately and points to institutional collection/learning resources. Review and replace/augment references with specific object or article citations before formal academic submission.
