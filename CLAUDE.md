# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint (v9, core-web-vitals + typescript)
npm start            # Start production server
```

No test framework is configured.

## Architecture

This is a **Next.js 16 App Router** application — an AI readiness assessment platform with two survey tracks (developer, business), team dashboards, campaign/QR tracking, and admin analytics.

### Data Flow

1. User completes multi-step survey → `POST /api/responses` validates with Zod, calculates scores via `lib/scoring.ts`, inserts to Supabase
2. Results page fetches response server-side and renders score visualizations
3. Teams aggregate individual responses into dashboards with heatmaps and timeline overlays
4. Campaign visits and funnel events are tracked client-side via hooks, stored in separate tables

### Scoring Engine (`src/lib/scoring.ts`)

Computes a 0-100 weighted readiness score from capability ratings. Five tiers with increasing weights (T1=1.0x through T5=2.5x). Also calculates:
- **Timeline position**: maps to a 2022-2026 timeline based on the latest "Integrated" (score=3) capability
- **Gap analysis**: months behind frontier, direction (widening/stable/closing)
- **Adaptation projection**: adoption rate extrapolated 12 months forward

### Capability Model (`src/lib/features/`)

- `types.ts` — `Capability` interface, `TIER_CONFIG` (5 tiers with weights/eras), `RESPONSE_SCALE` (4-point: Unaware→Integrated)
- `dev-features.ts` — ~50 developer capabilities (coding assistants → agentic systems)
- `business-features.ts` — ~30 business capabilities (chat tools → autonomous agents)

Each capability has an `id` (e.g. "T1_01"), `tier`, `firstAvailable` date, bilingual names, and examples.

### Survey Form (`src/components/survey/SurveyForm.tsx`)

8-step form using React Hook Form + Framer Motion animations. Steps: track select → profile → pre-assessment → current usage → mindset → feature matrix → post-assessment → free text. Each step fires funnel tracking events.

### Two Tracking Systems

- **Campaign tracking** (`src/lib/campaign.ts`, `src/hooks/useCampaignTracking.ts`): Stores `src`/`cid` from URL params in sessionStorage, records visit once per session, attaches to final response
- **Funnel tracking** (`src/hooks/useFunnelTracking.ts`): Tracks step enter/complete events with session-based deduplication via `useRef(new Set())`

### Key Path Aliases

`@/*` maps to `./src/*` (tsconfig paths).

### Supabase Integration

- `src/lib/supabase/server.ts` — server-side client using `@supabase/supabase-js` (prefers `SUPABASE_SERVICE_ROLE_KEY`, falls back to anon key)
- `src/lib/supabase/client.ts` — browser client using `@supabase/ssr`
- Database has a custom `nanoid()` function for ID generation (must be created before tables)

### Database Tables

Four tables in `supabase/schema.sql`: `responses` (survey data + computed scores + campaign attribution), `teams`, `campaign_visits`, `funnel_events`. All use nanoid primary keys.

### Internationalization

next-intl with `en.json` and `de.json` in `src/messages/`. Locale detected from cookie → Accept-Language → default `en`. All user-facing text uses translation keys.

## Conventions

- **UI components**: shadcn/ui (base-nova style) in `src/components/ui/`, added via `npx shadcn@latest add`
- **Styling**: Tailwind CSS 4 with `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge)
- **API validation**: All POST endpoints use Zod schemas
- **IDs**: nanoid for all database records (12 chars for responses, 6 for QR card IDs)
- **Privacy**: No cookies for analytics, sessionStorage only, no IP storage, bot filtering on visits
- **Scores computed server-side**: `calculateFullScores()` runs in the API route, result stored as JSONB

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # optional
```
