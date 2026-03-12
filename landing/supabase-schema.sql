-- BagsStudio Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Coins connected by creators
create table if not exists coins (
  id uuid primary key default uuid_generate_v4(),
  mint_address text unique not null,
  creator_wallet text not null,
  name text not null,
  symbol text not null,
  image_url text,
  connected_at timestamptz default now()
);

-- Cached conviction scores (refreshed periodically)
create table if not exists supporter_scores (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  wallet text not null,
  score numeric not null,
  tier text not null,
  claim_count integer not null default 0,
  total_claimed numeric not null default 0,
  first_claim_at timestamptz,
  last_claim_at timestamptz,
  computed_at timestamptz default now(),
  unique(mint_address, wallet)
);

-- Campaigns created by coin creators
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  creator_wallet text not null,
  name text not null,
  description text,
  type text not null default 'airdrop',
  tier_threshold text not null default 'Active',
  max_wallets integer,
  status text not null default 'draft',
  created_at timestamptz default now()
);

-- Campaign eligibility snapshots
create table if not exists campaign_eligibility (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  wallet text not null,
  score numeric not null,
  tier text not null,
  eligible boolean default true,
  claimed boolean default false,
  unique(campaign_id, wallet)
);

-- Indexes
create index if not exists idx_coins_mint on coins(mint_address);
create index if not exists idx_coins_creator on coins(creator_wallet);
create index if not exists idx_scores_mint on supporter_scores(mint_address);
create index if not exists idx_scores_wallet on supporter_scores(wallet);
create index if not exists idx_campaigns_mint on campaigns(mint_address);
create index if not exists idx_campaigns_creator on campaigns(creator_wallet);
create index if not exists idx_eligibility_campaign on campaign_eligibility(campaign_id);
create index if not exists idx_eligibility_wallet on campaign_eligibility(wallet);

-- Row Level Security
alter table coins enable row level security;
alter table supporter_scores enable row level security;
alter table campaigns enable row level security;
alter table campaign_eligibility enable row level security;

-- Public read access for campaigns and eligibility (supporters need to check)
create policy "Public read campaigns" on campaigns for select using (true);
create policy "Public read eligibility" on campaign_eligibility for select using (true);
create policy "Public read scores" on supporter_scores for select using (true);
create policy "Public read coins" on coins for select using (true);

-- Service role has full access (handled by service key)
