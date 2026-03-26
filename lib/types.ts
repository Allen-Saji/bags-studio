// Bags API types (matching official API docs)

// Wrapper for all Bags API responses
export interface BagsApiResponse<T> {
  success: boolean;
  response: T;
  error?: string;
}

// From /token-launch/creator/v3
export interface TokenCreator {
  username: string;
  pfp: string;
  royaltyBps: number;
  isCreator: boolean;
  wallet: string;
  provider: string | null;
  providerUsername: string | null;
  twitterUsername: string;
  bagsUsername: string;
  isAdmin: boolean;
}

// From /token-launch/claim-stats
export interface TokenClaimStat {
  username: string;
  pfp: string;
  royaltyBps: number;
  isCreator: boolean;
  wallet: string;
  provider: string | null;
  providerUsername: string | null;
  twitterUsername: string;
  bagsUsername: string;
  isAdmin: boolean;
  totalClaimed: string;
}

// Combined token metadata we build from on-chain data + Bags creators
export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  creator?: string;
  creators: TokenCreator[];
  description?: string;
}

// From /token-launch/lifetime-fees
export interface LifetimeFees {
  totalFeesLamports: string;
}

// From /solana/bags/pools/token-mint
export interface PoolInfo {
  tokenMint: string;
  dbcConfigKey: string;
  dbcPoolKey: string;
  dammV2PoolKey: string | null;
}

// From /fee-share/token/claim-events
export interface ClaimEvent {
  wallet: string;
  isCreator: boolean;
  amount: string; // string in API response
  signature: string;
  timestamp: string;
}

export interface ClaimEventsResponse {
  events: ClaimEvent[];
}

// From /fee-share/admin/list
export interface AdminListResponse {
  tokenMints: string[];
}

// Derived fee-share info for dashboard display
export interface FeeShareInfo {
  totalFeesLamports: string;
  claimStats: TokenClaimStat[];
  uniqueClaimers: number;
  totalClaimedLamports: number;
}

// On-chain token holder from DAS getTokenAccounts
export interface TokenHolder {
  wallet: string;
  balance: number; // raw token amount (before decimals)
  tokenAccount: string;
}

// Conviction scoring types

export interface WalletScore {
  wallet: string;
  score: number;
  tier: ConvictionTier;
  balanceScore: number;
  claimScore: number;
  consistencyScore: number;
  balance: number; // human-readable token balance (after decimals)
  claimCount: number;
  totalClaimed: number; // in lamports
  distinctDays: number;
}

export type ConvictionTier = 'Champion' | 'Catalyst' | 'Loyal' | 'Active' | 'OG';

// Campaign types

export interface Campaign {
  id: string;
  mint_address: string;
  creator_wallet: string;
  name: string;
  type: CampaignType;
  tier_threshold: ConvictionTier;
  max_wallets: number | null;
  status: CampaignStatus;
  created_at: string;
  description?: string;
}

export type CampaignType = 'airdrop' | 'allowlist' | 'nft_mint' | 'custom';
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface CampaignEligibility {
  id: string;
  campaign_id: string;
  wallet: string;
  score: number;
  tier: ConvictionTier;
  eligible: boolean;
  claimed: boolean;
}

// Coin record

export interface CoinRecord {
  id: string;
  mint_address: string;
  creator_wallet: string;
  name: string;
  symbol: string;
  image_url: string;
  connected_at: string;
}

// Engagement types

export type PointSource = 'hold' | 'claim' | 'referral' | 'quest' | 'streak' | 'stake';
export type QuestType = 'hold_duration' | 'claim_count' | 'referral_count' | 'social_share' | 'custom' | 'token_balance' | 'trade_volume' | 'streak' | 'tier_reached' | 'meta';
export type ReferralStatus = 'pending' | 'verified';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type FundingSource = 'bags_amm' | 'partner' | 'direct';
export type FeedEventType = 'quest_complete' | 'referral_verified' | 'streak_milestone' | 'tier_up' | 'reward_claimed';

export interface EngagementPoints {
  id: string;
  mint_address: string;
  wallet: string;
  points: number;
  source: PointSource;
  source_id: string | null;
  created_at: string;
}

export interface EngagementLeaderboardEntry {
  mint_address: string;
  wallet: string;
  total_points: number;
  referral_points: number;
  quest_points: number;
  streak_points: number;
  hold_points: number;
  stake_points: number;
  rank: number;
  updated_at: string;
}

export interface ReferralCode {
  code: string;
  mint_address: string;
  wallet: string;
  created_at: string;
}

export interface Referral {
  id: string;
  mint_address: string;
  referrer_wallet: string;
  referred_wallet: string;
  referral_code: string;
  status: ReferralStatus;
  verified_at: string | null;
  created_at: string;
}

export interface Quest {
  id: string;
  mint_address: string;
  creator_wallet: string;
  title: string;
  description: string | null;
  quest_type: QuestType;
  points_reward: number;
  target_value: number;
  requires_approval: boolean;
  max_completions: number | null;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface QuestCompletion {
  id: string;
  quest_id: string;
  wallet: string;
  completed_at: string;
}

export interface QuestSubmission {
  id: string;
  quest_id: string;
  wallet: string;
  proof_url: string | null;
  status: SubmissionStatus;
  reviewed_at: string | null;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  mint_address: string;
  wallet: string;
  event_type: FeedEventType;
  title: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface HoldingStreak {
  mint_address: string;
  wallet: string;
  current_streak: number;
  longest_streak: number;
  last_checked_at: string;
}

export interface RewardVault {
  mint_address: string;
  vault_wallet: string;
  fee_share_bps: number;
  funding_source: FundingSource;
  total_claimed: number;
  total_distributed: number;
  created_at: string;
  vault_state_pda?: string;
  treasury_pda?: string;
  on_chain?: boolean;
}

export interface RewardEpoch {
  id: string;
  mint_address: string;
  epoch_number: number;
  vault_balance: number;
  distributed: number;
  eligible_wallets: number;
  created_at: string;
}

export interface RewardClaim {
  id: string;
  epoch_id: string;
  mint_address: string;
  wallet: string;
  points_at_snapshot: number;
  reward_lamports: number;
  claimed: boolean;
  signature: string | null;
  claimed_at: string | null;
}

// Social / Community types

export interface CommunityPost {
  id: string;
  mint_address: string;
  wallet: string;
  content: string;
  created_at: string;
  reactions?: ReactionCount[];
}

export interface PostReaction {
  id: string;
  post_id: string;
  wallet: string;
  emoji: string;
  created_at: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
}

export type BadgeType = 'og_holder' | 'diamond_hands' | 'quest_master' | 'evangelist' | 'whale' | 'social_butterfly';

export interface Achievement {
  id: string;
  mint_address: string;
  wallet: string;
  badge_type: BadgeType;
  earned_at: string;
}

export interface UserProfile {
  wallet: string;
  username: string | null;
  pfp: string | null;
  tier: ConvictionTier | null;
  total_points: number;
  hold_points: number;
  quest_points: number;
  referral_points: number;
  streak_points: number;
  current_streak: number;
  longest_streak: number;
  quests_completed: number;
  referral_count: number;
  post_count: number;
  achievements: Achievement[];
}

// Staking types

export interface StakePosition {
  mint_address: string;
  wallet: string;
  amount: number;
  staked_at: string | null;
  last_points_claim_ts: string | null;
  stake_pool_pda: string;
  user_stake_pda: string;
  updated_at: string;
}

export interface TokenLockRecord {
  id: string;
  mint_address: string;
  creator_wallet: string;
  lock_index: number;
  amount: number;
  lock_start: string;
  lock_end: string;
  released: boolean;
  token_lock_pda: string;
  created_at: string;
}
