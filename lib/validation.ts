import { TIER_ORDER, CAMPAIGN_TYPES } from './constants';

export interface ValidationErrors {
  [field: string]: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrors;
}

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function validateCampaignInput(body: Record<string, unknown>): ValidationResult {
  const errors: ValidationErrors = {};

  // name
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.name = 'Campaign name is required';
  } else if (body.name.trim().length > 100) {
    errors.name = 'Campaign name must be 100 characters or fewer';
  }

  // mint_address
  if (!body.mint_address || typeof body.mint_address !== 'string') {
    errors.mint_address = 'Mint address is required';
  } else if (!BASE58_RE.test(body.mint_address)) {
    errors.mint_address = 'Invalid mint address';
  }

  // creator_wallet
  if (!body.creator_wallet || typeof body.creator_wallet !== 'string') {
    errors.creator_wallet = 'Creator wallet is required';
  } else if (!BASE58_RE.test(body.creator_wallet)) {
    errors.creator_wallet = 'Invalid wallet address';
  }

  // type
  const validTypes: string[] = CAMPAIGN_TYPES.map(t => t.value);
  if (!body.type || !validTypes.includes(body.type as string)) {
    errors.type = `Type must be one of: ${validTypes.join(', ')}`;
  }

  // tier_threshold
  if (!body.tier_threshold || !TIER_ORDER.includes(body.tier_threshold as never)) {
    errors.tier_threshold = `Tier must be one of: ${TIER_ORDER.join(', ')}`;
  }

  // max_wallets (optional)
  if (body.max_wallets != null) {
    const n = Number(body.max_wallets);
    if (!Number.isInteger(n) || n < 1) {
      errors.max_wallets = 'Max wallets must be a positive integer';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
