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

## Optional AI mode

Add keys to `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
OPENAI_API_KEY=your_openai_api_key
OPENAI_IMAGE_MODEL=gpt-image-1
```

Restart the development server and switch the header control to **AI MODE ON**. Gemini writes the personalised chapter and image prompt; OpenAI Images generates the artwork. API usage may incur charges. Never put secret keys in `NEXT_PUBLIC_` variables or commit `.env.local`.

## Persistence

The initial MVP persists the complete journey in browser local storage, which makes the demo easy to run without infrastructure. The Supabase migration in `supabase/migrations/001_initial.sql` defines the remote schema for the next integration step. Before enabling remote persistence, add per-journey ownership, appropriate Row Level Security policies and server-side writes. The service-role key must remain server-only.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, select **Add New → Project** and import `Chimpfreak/ArtThroughYou`.
3. Keep the framework preset as Next.js and the root directory as `.`.
4. Add `GEMINI_API_KEY`, `GEMINI_MODEL`, and `GEMINI_IMAGE_MODEL` as environment variables if using Gemini AI mode.
5. Deploy. Demo Mode works without these keys.

A GitHub push does not itself publish a Next.js app. Vercel must be connected and the deployment must complete successfully.

## Project structure

```text
src/app/                 Next.js pages and API routes
src/app/api/story/       Gemini narrative endpoint\nsrc/app/api/question/    Gemini adaptive-question endpoint\nsrc/app/api/timelines/   Gemini portrait timeline endpoint\nsrc/lib/gemini.ts        Shared Gemini API helper
src/app/api/artwork/     Gemini image-generation endpoint
src/lib/eras.ts          Curated era configuration and historical notes
src/lib/types.ts         Journey and memory types
supabase/migrations/     Initial database schema
```

## Current MVP scope

- Five fixed historical eras and curated historical context.
- Six distinct choices per chapter, with varied ordering.
- Persistent journey state and evolving symbol/theme memory.
- Gemini-generated artwork, adaptive questions, personalised stories and four parallel-life portrait sheet; curated demo fallbacks when no key is configured.
- Final chronological gallery and print stylesheet.
- Local browser persistence and AI API endpoints.

## Historical note

The narrative is fictional. Historical context is presented separately and points to institutional collection/learning resources. Review and replace/augment references with specific object or article citations before formal academic submission.
