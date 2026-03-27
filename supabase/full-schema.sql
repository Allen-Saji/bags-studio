-- BagsStudio Complete Schema
-- Run this once on a fresh Supabase project
-- Includes: base schema + all migrations

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- Core Tables
-- ============================================================

create table if not exists coins (
  id uuid primary key default uuid_generate_v4(),
  mint_address text unique not null,
  creator_wallet text not null,
  name text not null,
  symbol text not null,
  image_url text,
  connected_at timestamptz default now()
);

create table if not exists supporter_scores (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  wallet text not null,
  score numeric not null,
  tier text not null,
  claim_count integer not null default 0,
  total_claimed numeric not null default 0,
  balance_score numeric not null default 0,
  claim_score numeric not null default 0,
  consistency_score numeric not null default 0,
  balance numeric not null default 0,
  distinct_days integer not null default 0,
  computed_at timestamptz default now(),
  unique(mint_address, wallet)
);

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

-- ============================================================
-- Engagement Tables
-- ============================================================

create table if not exists reward_vaults (
  mint_address text primary key,
  vault_wallet text not null,
  fee_share_bps int default 0,
  funding_source text default 'direct',
  total_claimed numeric default 0,
  total_distributed numeric default 0,
  created_at timestamptz default now(),
  -- On-chain fields
  vault_state_pda text,
  treasury_pda text,
  on_chain boolean default false
);

create table if not exists engagement_points (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  wallet text not null,
  points int not null,
  source text not null check (source in ('hold', 'claim', 'referral', 'quest', 'streak', 'stake')),
  source_id text,
  created_at timestamptz default now()
);

create table if not exists engagement_leaderboard (
  mint_address text not null,
  wallet text not null,
  total_points numeric default 0,
  referral_points numeric default 0,
  quest_points numeric default 0,
  streak_points numeric default 0,
  hold_points numeric default 0,
  stake_points numeric default 0,
  rank int default 0,
  updated_at timestamptz default now(),
  primary key (mint_address, wallet)
);

create table if not exists referral_codes (
  code text primary key,
  mint_address text not null,
  wallet text not null,
  created_at timestamptz default now(),
  unique (mint_address, wallet)
);

create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  referrer_wallet text not null,
  referred_wallet text not null,
  referral_code text not null,
  status text default 'pending',
  verified_at timestamptz,
  created_at timestamptz default now(),
  unique (mint_address, referred_wallet)
);

create table if not exists quests (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  creator_wallet text not null,
  title text not null,
  description text,
  quest_type text not null check (quest_type in ('hold_duration', 'claim_count', 'referral_count', 'social_share', 'custom', 'token_balance', 'trade_volume', 'streak', 'tier_reached', 'meta')),
  points_reward int not null default 50,
  target_value int default 1,
  requires_approval boolean default false,
  max_completions int,
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists quest_completions (
  id uuid primary key default uuid_generate_v4(),
  quest_id uuid references quests(id) on delete cascade,
  wallet text not null,
  completed_at timestamptz default now(),
  unique (quest_id, wallet)
);

create table if not exists quest_submissions (
  id uuid primary key default uuid_generate_v4(),
  quest_id uuid references quests(id) on delete cascade,
  wallet text not null,
  proof_url text,
  status text default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique (quest_id, wallet)
);

create table if not exists activity_feed (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  wallet text not null,
  event_type text not null check (event_type in ('quest_complete', 'referral_verified', 'streak_milestone', 'tier_up', 'reward_claimed')),
  title text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists holding_streaks (
  mint_address text not null,
  wallet text not null,
  current_streak int default 0,
  longest_streak int default 0,
  last_checked_at timestamptz default now(),
  primary key (mint_address, wallet)
);

create table if not exists reward_epochs (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  epoch_number int not null,
  vault_balance numeric default 0,
  distributed numeric default 0,
  eligible_wallets int default 0,
  created_at timestamptz default now(),
  -- On-chain fields
  merkle_root text,
  epoch_ends_at timestamptz,
  total_allocation_lamports numeric default 0,
  unique (mint_address, epoch_number)
);

create table if not exists reward_claims (
  id uuid primary key default uuid_generate_v4(),
  epoch_id uuid references reward_epochs(id) on delete cascade,
  mint_address text not null,
  wallet text not null,
  points_at_snapshot numeric default 0,
  reward_lamports numeric default 0,
  claimed boolean default false,
  signature text,
  claimed_at timestamptz,
  -- On-chain fields
  merkle_proof jsonb,
  on_chain_epoch numeric,
  unique (epoch_id, wallet)
);

create table if not exists trade_logs (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  wallet text not null,
  input_mint text not null,
  output_mint text not null,
  amount_in numeric not null,
  amount_out numeric not null default 0,
  created_at timestamptz default now()
);

create table if not exists community_posts (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  wallet text not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists post_reactions (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references community_posts(id) on delete cascade,
  wallet text not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique (post_id, wallet, emoji)
);

create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  wallet text not null,
  badge_type text not null,
  earned_at timestamptz default now(),
  unique (mint_address, wallet, badge_type)
);

-- ============================================================
-- Staking & Lock Tables
-- ============================================================

create table if not exists stake_positions (
  mint_address text not null,
  wallet text not null,
  amount numeric not null default 0,
  staked_at timestamptz,
  last_points_claim_ts timestamptz,
  stake_pool_pda text not null,
  user_stake_pda text not null,
  updated_at timestamptz default now(),
  primary key (mint_address, wallet)
);

create table if not exists token_locks (
  id uuid primary key default uuid_generate_v4(),
  mint_address text not null,
  creator_wallet text not null,
  lock_index smallint not null,
  amount numeric not null,
  lock_start timestamptz not null,
  lock_end timestamptz not null,
  released boolean default false,
  token_lock_pda text not null,
  created_at timestamptz default now(),
  unique (mint_address, creator_wallet, lock_index)
);

-- ============================================================
-- All Indexes
-- ============================================================

create index if not exists idx_coins_mint on coins(mint_address);
create index if not exists idx_coins_creator on coins(creator_wallet);
create index if not exists idx_scores_mint on supporter_scores(mint_address);
create index if not exists idx_scores_wallet on supporter_scores(wallet);
create index if not exists idx_campaigns_mint on campaigns(mint_address);
create index if not exists idx_campaigns_creator on campaigns(creator_wallet);
create index if not exists idx_eligibility_campaign on campaign_eligibility(campaign_id);
create index if not exists idx_eligibility_wallet on campaign_eligibility(wallet);
create index if not exists idx_engagement_points_mint on engagement_points(mint_address);
create index if not exists idx_engagement_points_wallet on engagement_points(wallet);
create index if not exists idx_engagement_points_source on engagement_points(source);
create index if not exists idx_engagement_leaderboard_mint on engagement_leaderboard(mint_address);
create index if not exists idx_engagement_leaderboard_rank on engagement_leaderboard(mint_address, rank);
create index if not exists idx_referral_codes_mint on referral_codes(mint_address);
create index if not exists idx_referral_codes_wallet on referral_codes(wallet);
create index if not exists idx_referrals_mint on referrals(mint_address);
create index if not exists idx_referrals_referrer on referrals(referrer_wallet);
create index if not exists idx_referrals_referred on referrals(referred_wallet);
create index if not exists idx_referrals_code on referrals(referral_code);
create index if not exists idx_quests_mint on quests(mint_address);
create index if not exists idx_quests_creator on quests(creator_wallet);
create index if not exists idx_quests_active on quests(mint_address, active);
create index if not exists idx_quest_completions_quest on quest_completions(quest_id);
create index if not exists idx_quest_completions_wallet on quest_completions(wallet);
create index if not exists idx_quest_submissions_quest on quest_submissions(quest_id);
create index if not exists idx_quest_submissions_wallet on quest_submissions(wallet);
create index if not exists idx_quest_submissions_status on quest_submissions(status);
create index if not exists idx_activity_feed_mint on activity_feed(mint_address);
create index if not exists idx_activity_feed_wallet on activity_feed(wallet);
create index if not exists idx_activity_feed_created on activity_feed(mint_address, created_at desc);
create index if not exists idx_holding_streaks_mint on holding_streaks(mint_address);
create index if not exists idx_reward_epochs_mint on reward_epochs(mint_address);
create index if not exists idx_reward_claims_epoch on reward_claims(epoch_id);
create index if not exists idx_reward_claims_mint on reward_claims(mint_address);
create index if not exists idx_reward_claims_wallet on reward_claims(wallet);
create index if not exists idx_trade_logs_mint_wallet on trade_logs(mint_address, wallet);
create index if not exists idx_trade_logs_wallet on trade_logs(wallet);
create index if not exists idx_community_posts_mint_time on community_posts(mint_address, created_at desc);
create index if not exists idx_community_posts_wallet on community_posts(wallet);
create index if not exists idx_post_reactions_post on post_reactions(post_id);
create index if not exists idx_achievements_mint_wallet on achievements(mint_address, wallet);
create index if not exists idx_stake_positions_mint on stake_positions(mint_address);
create index if not exists idx_stake_positions_wallet on stake_positions(wallet);
create index if not exists idx_token_locks_mint on token_locks(mint_address);
create index if not exists idx_token_locks_creator on token_locks(creator_wallet);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table coins enable row level security;
alter table supporter_scores enable row level security;
alter table campaigns enable row level security;
alter table campaign_eligibility enable row level security;
alter table reward_vaults enable row level security;
alter table engagement_points enable row level security;
alter table engagement_leaderboard enable row level security;
alter table referral_codes enable row level security;
alter table referrals enable row level security;
alter table quests enable row level security;
alter table quest_completions enable row level security;
alter table quest_submissions enable row level security;
alter table activity_feed enable row level security;
alter table holding_streaks enable row level security;
alter table reward_epochs enable row level security;
alter table reward_claims enable row level security;
alter table trade_logs enable row level security;
alter table community_posts enable row level security;
alter table post_reactions enable row level security;
alter table achievements enable row level security;
alter table stake_positions enable row level security;
alter table token_locks enable row level security;

-- Public read policies
create policy "Public read coins" on coins for select using (true);
create policy "Public read scores" on supporter_scores for select using (true);
create policy "Public read campaigns" on campaigns for select using (true);
create policy "Public read eligibility" on campaign_eligibility for select using (true);
create policy "Public read reward_vaults" on reward_vaults for select using (true);
create policy "Public read engagement_points" on engagement_points for select using (true);
create policy "Public read engagement_leaderboard" on engagement_leaderboard for select using (true);
create policy "Public read referral_codes" on referral_codes for select using (true);
create policy "Public read referrals" on referrals for select using (true);
create policy "Public read quests" on quests for select using (true);
create policy "Public read quest_completions" on quest_completions for select using (true);
create policy "Public read quest_submissions" on quest_submissions for select using (true);
create policy "Public read activity_feed" on activity_feed for select using (true);
create policy "Public read holding_streaks" on holding_streaks for select using (true);
create policy "Public read reward_epochs" on reward_epochs for select using (true);
create policy "Public read reward_claims" on reward_claims for select using (true);
create policy "Public read trade_logs" on trade_logs for select using (true);
create policy "Public read community_posts" on community_posts for select using (true);
create policy "Public read post_reactions" on post_reactions for select using (true);
create policy "Public read achievements" on achievements for select using (true);
create policy "Public read stake_positions" on stake_positions for select using (true);
create policy "Public read token_locks" on token_locks for select using (true);
