# BagsStudio

The engagement platform for [Bags](https://bags.fm) coins. Launch tokens, trade, claim fees, run quests, and reward your most active supporters — all without leaving BagsStudio.

> **Turn launch hype into lasting community momentum.**

## What it does

BagsStudio wraps the full Bags experience (launch, trade, claim, apps) and layers an engagement system on top: points, referrals, quests, streaks, and SOL-denominated rewards funded by trading fees.

| Layer | Features |
|---|---|
| **Bags Wrapper** | Token launch wizard, swap UI, fee claiming, Bags apps marketplace |
| **Engagement** | Points system (with 10%/mo decay), referral program, quest builder, holding streaks, activity feed |
| **Rewards** | Fee-share vault config, weekly epoch distribution, pro-rata SOL claims |

## Tech stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Database** — [Supabase](https://supabase.com) (PostgreSQL + RLS)
- **Chain** — [Solana](https://solana.com) mainnet via [Helius](https://helius.dev) RPC
- **Wallet** — `@solana/wallet-adapter` (Phantom, Solflare)
- **Styling** — [Tailwind CSS 4](https://tailwindcss.com)
- **Animations** — [Framer Motion](https://www.framer.com/motion)
- **Data fetching** — [SWR](https://swr.vercel.app)
- **Tests** — [Playwright](https://playwright.dev)

## Getting started

### Prerequisites

- Node.js 18+
- A [Bags API key](https://docs.bags.fm)
- A [Supabase](https://supabase.com) project
- A [Helius](https://helius.dev) API key (optional, falls back to public RPC)

### Setup

```bash
# Clone and install
git clone https://github.com/your-org/bags-studio.git
cd bags-studio
npm install

# Configure environment
cp .env.example .env
# Fill in BAGS_API_KEY, SUPABASE_*, HELIUS_API_KEY, CRON_SECRET

# Run the schema migration
# Copy supabase-schema.sql into the Supabase SQL Editor and execute

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `BAGS_API_KEY` | Yes | Bags public API key |
| `HELIUS_API_KEY` | No | Helius RPC key (faster + higher limits) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key (server-side writes) |
| `CRON_SECRET` | Yes | Auth token for cron job endpoints |

## Project structure

```
app/
  api/
    bags/[...path]/     # Bags API proxy (GET + POST)
    launch/             # Token launch (metadata, config, tx)
    trade/              # Swap quote + transaction
    fees/               # Claimable positions + claim txs
    engage/[mint]/      # Points, referrals, quests, feed, vault, rewards
    cron/               # Daily streak/points refresh, weekly reward epochs
    dashboard/[mint]/   # Consolidated dashboard data
    campaigns/          # Campaign CRUD + eligibility
    score/[mint]/       # Conviction score computation
  studio/
    launch/             # Token launch wizard
    [mint]/             # Dashboard, trade, quests, rewards, apps, campaigns
  r/[code]/             # Referral interstitial page
  campaign/[id]/        # Public campaign view

components/studio/      # Reusable UI components
lib/                    # Core business logic
  bags-wrapper.ts       # Bags API helpers (launch, trade, fees)
  points.ts             # Points ledger + decay + leaderboard
  referral.ts           # Referral code generation + verification
  quests.ts             # Quest CRUD + auto-check + submissions
  streaks.ts            # Holding streak tracking
  rewards.ts            # Vault config + epoch creation + claims
  feed.ts               # Activity feed
  conviction.ts         # Conviction scoring algorithm
  cache.ts              # In-memory TTL cache
  score-cache.ts        # Supabase-backed score cache
```

## Architecture

```
┌─────────────────────────────────────────────┐
│              BagsStudio Frontend             │
│  Launch  Trade  Claim  Apps  Engage          │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│           Next.js API Routes                │
│  /api/launch  /api/trade  /api/engage       │
│  /api/fees    /api/cron   /api/dashboard    │
└──┬──────────┬──────────┬───────────────────┘
   │          │          │
   ▼          ▼          ▼
 Bags API   Helius    Supabase
 (launch,   (holders,  (points, quests,
  trade,     metadata)  referrals, feed,
  fees,                 rewards, streaks)
  apps)
```

### Key design decisions

- **Non-custodial** — users sign all transactions via wallet adapter; the server never holds keys
- **Append-only points** — engagement points are an immutable ledger; the leaderboard is a materialized view with decay applied at read time
- **Complementary to DividendsBot** — DividendsBot handles passive holder rewards, BagsStudio handles active engagement rewards
- **Referral interstitial** — referral links go to a branded landing page, not directly to Bags
- **Social quest approval** — social_share and custom quests require manual creator approval; other types are auto-verified

## Cron jobs

Two cron endpoints need to be called on a schedule (e.g. via [Vercel Cron](https://vercel.com/docs/cron-jobs)):

| Endpoint | Schedule | What it does |
|---|---|---|
| `POST /api/cron/daily-refresh` | Daily | Updates holding streaks, awards daily hold/streak points, refreshes leaderboard ranks |
| `POST /api/cron/weekly-rewards` | Weekly | Checks vault balances, creates reward epochs with pro-rata distribution |

Both require an `Authorization: Bearer <CRON_SECRET>` header.

## Scripts

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
npx playwright test  # E2E tests
```

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Open a PR against `main`

## License

MIT

---

Built for the [Bags Hackathon](https://bags.fm). Powered by Bags.
