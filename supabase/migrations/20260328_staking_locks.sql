-- Add 'stake' to engagement_points source CHECK
ALTER TABLE engagement_points DROP CONSTRAINT IF EXISTS engagement_points_source_check;
ALTER TABLE engagement_points ADD CONSTRAINT engagement_points_source_check
  CHECK (source IN ('hold', 'claim', 'referral', 'quest', 'streak', 'stake'));

-- Cache staking positions (denormalized from on-chain)
CREATE TABLE IF NOT EXISTS stake_positions (
  mint_address text NOT NULL,
  wallet text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  staked_at timestamptz,
  last_points_claim_ts timestamptz,
  stake_pool_pda text NOT NULL,
  user_stake_pda text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (mint_address, wallet)
);

-- Cache creator locks (denormalized from on-chain)
CREATE TABLE IF NOT EXISTS token_locks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mint_address text NOT NULL,
  creator_wallet text NOT NULL,
  lock_index smallint NOT NULL,
  amount numeric NOT NULL,
  lock_start timestamptz NOT NULL,
  lock_end timestamptz NOT NULL,
  released boolean DEFAULT false,
  token_lock_pda text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (mint_address, creator_wallet, lock_index)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stake_positions_mint ON stake_positions(mint_address);
CREATE INDEX IF NOT EXISTS idx_stake_positions_wallet ON stake_positions(wallet);
CREATE INDEX IF NOT EXISTS idx_token_locks_mint ON token_locks(mint_address);
CREATE INDEX IF NOT EXISTS idx_token_locks_creator ON token_locks(creator_wallet);

-- RLS
ALTER TABLE stake_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_locks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read stake_positions" ON stake_positions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Public read token_locks" ON token_locks FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add stake_points column to leaderboard
ALTER TABLE engagement_leaderboard ADD COLUMN IF NOT EXISTS stake_points numeric DEFAULT 0;
