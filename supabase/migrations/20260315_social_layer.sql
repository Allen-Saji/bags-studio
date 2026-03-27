-- Social Community Layer: posts, reactions, achievements

CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mint_address text NOT NULL,
  wallet text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_mint_time ON community_posts (mint_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_wallet ON community_posts (wallet);

CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  wallet text NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, wallet, emoji)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions (post_id);

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mint_address text NOT NULL,
  wallet text NOT NULL,
  badge_type text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE (mint_address, wallet, badge_type)
);

CREATE INDEX IF NOT EXISTS idx_achievements_mint_wallet ON achievements (mint_address, wallet);

-- RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read community_posts" ON community_posts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Public read post_reactions" ON post_reactions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
