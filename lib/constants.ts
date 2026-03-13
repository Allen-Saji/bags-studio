import { ConvictionTier } from './types';

export const BAGS_API_BASE = 'https://public-api-v2.bags.fm/api/v1';

export const TIER_PERCENTILES: Record<ConvictionTier, number> = {
  Champion: 0.01,
  Catalyst: 0.05,
  Loyal: 0.15,
  Active: 0.40,
  OG: 1.0,
};

export const TIER_COLORS: Record<ConvictionTier, string> = {
  Champion: '#FFD700',
  Catalyst: '#C084FC',
  Loyal: '#00E676',
  Active: '#60A5FA',
  OG: '#A1A1A1',
};

export const TIER_ORDER: ConvictionTier[] = ['Champion', 'Catalyst', 'Loyal', 'Active', 'OG'];

export const CAMPAIGN_TYPES = [
  { value: 'airdrop', label: 'Airdrop' },
  { value: 'allowlist', label: 'Allowlist' },
  { value: 'nft_mint', label: 'NFT Mint' },
  { value: 'custom', label: 'Custom' },
] as const;

// Bags API endpoint paths (based on official docs)
export const BAGS_ENDPOINTS = {
  TOKEN_CREATORS: '/token-launch/creator/v3',
  TOKEN_CLAIM_STATS: '/token-launch/claim-stats',
  TOKEN_LIFETIME_FEES: '/token-launch/lifetime-fees',
  CLAIM_EVENTS: '/fee-share/token/claim-events',
  ADMIN_LIST: '/fee-share/admin/list',
  POOL_BY_MINT: '/solana/bags/pools/token-mint',
} as const;
