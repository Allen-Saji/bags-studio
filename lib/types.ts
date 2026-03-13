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
