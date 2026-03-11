# AI Readiness Checker

A comprehensive AI readiness assessment platform built by **Teclead Ventures**. It helps individuals and teams measure their AI tool adoption maturity across a 5-tier capability model, with dedicated tracks for developers and business professionals.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript, React 19
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **i18n**: next-intl (English & German)
- **Deployment**: Vercel

## Features

### Survey Engine

The core assessment is a multi-step survey with two tracks:

- **Developer Track** — ~50 capabilities across coding assistants, IDE integrations, agentic workflows, and advanced configuration
- **Business Track** — ~30 capabilities across chat assistants, productivity tools, office integrations, and autonomous agents

Each capability is rated on a 4-point awareness scale: Unaware, Aware, Tried, Integrated.

The survey collects:
1. **Track selection** (dev or business)
2. **Profile** (role, experience, languages/industry, company size)
3. **Pre-assessment** (self-score, utilization estimate, confidence)
4. **Current AI usage** (tools, modes, frequency)
5. **Mindset** (openness, barriers, priority areas)
6. **Feature matrix** (tier-by-tier capability awareness)
7. **Post-assessment** (updated self-score, utilization, potential)
8. **Free text** (optional feedback)

### 5-Tier Capability Model

Capabilities are organized into five maturity tiers, each with a time-period weight:

| Tier | Name | Era | Weight |
|------|------|-----|--------|
| T1 | Table Stakes | 2022-2023 | 1.0x |
| T2 | Productive Usage | 2023-2024 | 1.25x |
| T3 | Integrated Workflows | 2024 | 1.5x |
| T4 | Advanced Configuration | 2025 | 2.0x |
| T5 | Frontier | 2026 | 2.5x |

### Scoring & Results

Each completed survey produces:

- **Overall readiness score** (0-100) with a label from "Getting Started" to "Pioneer"
- **Per-tier scores** showing progression through each maturity level
- **Radar chart** visualizing strengths and gaps across tiers
- **Timeline position** — maps the respondent to a point on a 2022-2026 timeline based on their capability adoption
- **Gap analysis** — months behind the current frontier, with direction (widening/stable/closing)
- **Projected position** — dashed line showing where the respondent is heading based on their adaptation rate
- **Awareness & utilization gaps** — before vs. after self-assessment comparison
- **Opportunities list** — actionable recommendations based on gaps
- **Feature breakdown** — list of capabilities already integrated

### Team Dashboards

Teams allow organizations to aggregate and compare individual results:

- **Create a team** with a name, track preset, and optional anonymity
- **Share survey links** so team members complete the assessment within the team context
- **Team overview** — member count, average scores, score distribution
- **Member table** — individual scores, timeline positions, gap months per member
- **Category heatmap** — feature adoption matrix across all team members by tier
- **Adaptation summary** — team-level adaptation metrics and direction distribution
- **Team timeline overlay** — all members plotted on a shared timeline with colored dots (green = closing gap, red = widening), team average line, and frontier marker
- **CSV export** of all team responses

### Campaign Tracking (QR Codes & Links)

Track survey visits and conversions from physical or digital campaigns:

- **QR code generator** — batch-generate QR codes with unique card IDs for events, business cards, etc.
- **Campaign URL format**: `/?src={source}&cid={card-id}`
- **Redirect route** (`/c/{slug}?cid=...`) — server-side visit recording with bot filtering, then 307 redirect to the survey
- **Client-side fallback** — records visits via API if the redirect route wasn't used
- **Session-based deduplication** — each visit counted once per browser session
- **Attribution** — campaign source and card ID are attached to the final survey response

### Funnel Analytics

Step-by-step tracking of the entire user journey:

- **12 tracked steps**: Landing, Survey Start, Track Select, Profile, Pre-Assessment, Current Usage, Mindset, Feature Matrix, Post-Assessment, Free Text, Submit, Results View
- **Entry and completion events** per step with session deduplication
- **Drop-off rates** between consecutive steps
- **Median time-on-step** calculations
- **Filter by campaign source and date range**

### Admin Dashboard

A comprehensive analytics backend at `/admin`:

- **Summary cards** — total responses, teams, average score, average gap
- **Score range filters** — filter responses by tier brackets (0-30%, 31-55%, 56-75%, 76-100%)
- **Response table** — all submissions with score badges, timeline positions, campaign attribution, team assignment
- **Campaign performance** (`/admin/campaigns`) — visits vs. completions per source, daily trends, per-card drill-down, conversion rates
- **Funnel analysis** (`/admin/funnel`) — visual funnel chart with drop-off highlighting (red for >20%), step detail table, time-on-step data
- **CSV export** of all responses

### Privacy & Compliance

- Cookie-free, anonymous analytics
- Session storage only (no cookies, no localStorage persistence)
- No IP addresses stored
- Bot filtering on campaign visit recording
- GDPR/DSGVO compliant
- Footer links to Impressum and Datenschutz

### Internationalization

Full German and English support across all pages, survey questions, results labels, and admin interfaces. Language is detected from browser preferences and switchable via the header toggle.

## Pages Overview

| Route | Description |
|-------|-------------|
| `/` | Landing page with CTA and team join field |
| `/survey` | Multi-step survey form |
| `/survey/[id]/results` | Individual results with scores, charts, timeline |
| `/team/new` | Create a new team |
| `/team/[id]` | Team dashboard with aggregated results |
| `/team/[id]/survey` | Team-specific survey entry point |
| `/admin` | Admin dashboard with response table and stats |
| `/admin/campaigns` | Campaign performance analytics |
| `/admin/funnel` | Funnel drop-off analysis |
| `/c/[slug]` | QR code redirect route (records visit, redirects to survey) |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/responses` | Submit a survey response |
| GET | `/api/responses` | List all responses |
| GET | `/api/responses/[id]` | Get single response |
| GET | `/api/responses/export` | Export responses as CSV |
| POST | `/api/teams` | Create a team |
| GET | `/api/teams` | List all teams |
| GET | `/api/teams/[id]` | Get team with responses |
| GET | `/api/teams/[id]/export` | Export team responses as CSV |
| POST | `/api/campaign/visits` | Record a campaign visit |
| POST | `/api/analytics/funnel` | Record a funnel event |
| GET | `/api/admin/campaigns` | Campaign performance data |
| GET | `/api/admin/funnel` | Funnel analytics data |
| GET | `/api/admin/stats` | Aggregate statistics |

## Database Schema

Four tables in Supabase:

- **`responses`** — survey submissions with profile, features, scores, campaign attribution
- **`teams`** — team metadata (name, creator, track preset, language)
- **`campaign_visits`** — visit records from QR codes and campaign links
- **`funnel_events`** — step-level tracking events for funnel analysis

See `supabase/schema.sql` for the full schema with indexes.

## Project Structure

```
src/
  app/                    # Next.js App Router pages and API routes
    admin/                # Admin dashboard, campaigns, funnel
    api/                  # REST API endpoints
    c/[slug]/             # QR code redirect route
    survey/               # Survey form and results pages
    team/                 # Team creation and dashboards
  components/
    admin/                # Campaign and funnel chart components
    results/              # Score gauges, charts, timeline, recommendations
    survey/               # Multi-step form components
    team/                 # Team dashboard components
    ui/                   # shadcn/ui primitives
  hooks/                  # useCampaignTracking, useFunnelTracking
  lib/
    campaign.ts           # Session storage helpers for campaign tracking
    features/             # Capability definitions (dev + business) and tier config
    scoring.ts            # Score calculation, timeline analysis, adaptation rates
    supabase/             # Server and browser Supabase clients
    i18n.ts               # Locale detection
    utils.ts              # Tailwind class merger
  messages/               # en.json, de.json translation files
  types/                  # TypeScript type definitions
scripts/
  generate-qr-codes.ts   # Batch QR code generator with manifest CSV
supabase/
  schema.sql              # Database schema and indexes
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

Run the SQL in `supabase/schema.sql` against your Supabase project to create all tables and indexes.

### Generate QR Codes

```bash
npx tsx scripts/generate-qr-codes.ts \
  --group tech-talk \
  --count 500 \
  --base-url https://your-domain.vercel.app
```

Outputs to `./qr-codes/{group}/` with PNG files and a `manifest.csv`.

## Deployment

Deploy to Vercel with the Supabase environment variables configured in the project settings. The app uses Edge-compatible server components and API routes.
