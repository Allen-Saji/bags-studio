use anchor_lang::prelude::*;

#[account]
pub struct VaultState {
    /// The admin (creator) who initialized this vault
    pub admin: Pubkey,
    /// The token mint this vault distributes rewards for
    pub token_mint: Pubkey,
    /// Bump seed for the vault_state PDA itself
    pub vault_state_bump: u8,
    /// Bump seed for the treasury PDA
    pub treasury_bump: u8,
    /// Current merkle root for reward claims
    pub merkle_root: [u8; 32],
    /// Current epoch number (increments on each distribution)
    pub current_epoch: u64,
    /// Total lamports distributed across all epochs (informational)
    pub total_distributed: u64,
    /// When the current epoch was created (unix timestamp)
    pub epoch_created_at: i64,
    /// When the current epoch expires (unix timestamp, +7 days)
    pub epoch_ends_at: i64,
}

impl VaultState {
    pub const LEN: usize = 32 + 32 + 1 + 1 + 32 + 8 + 8 + 8 + 8; // 130 bytes
}

#[account]
pub struct ClaimStatus {
    /// Whether this claim has been executed
    pub claimed: bool,
    /// The epoch this claim belongs to
    pub claim_epoch: u64,
    /// The claimant's pubkey (for rent refund on close)
    pub claimant: Pubkey,
    /// The amount claimed in lamports
    pub amount: u64,
}

impl ClaimStatus {
    pub const LEN: usize = 1 + 8 + 32 + 8; // 49 bytes
}

// --- Events ---

#[event]
pub struct VaultInitialized {
    pub vault: Pubkey,
    pub admin: Pubkey,
    pub token_mint: Pubkey,
    pub treasury: Pubkey,
}

#[event]
pub struct DistributionUpdated {
    pub vault: Pubkey,
    pub epoch: u64,
    pub merkle_root: [u8; 32],
    pub total_distribution: u64,
}

#[event]
pub struct RewardClaimed {
    pub vault: Pubkey,
    pub claimant: Pubkey,
    pub amount: u64,
    pub epoch: u64,
}

#[event]
pub struct ClaimStatusClosed {
    pub vault: Pubkey,
    pub claimant: Pubkey,
    pub epoch: u64,
}

// ============================
// STAKING ACCOUNTS
// ============================

#[account]
pub struct StakePool {
    pub admin: Pubkey,
    pub token_mint: Pubkey,
    pub total_staked: u64,
    pub min_stake_amount: u64,
    pub points_per_token_per_day: u64,
    pub stake_pool_bump: u8,
    pub token_decimals: u8,
}

impl StakePool {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 1 + 1; // 90 bytes
}

#[account]
pub struct UserStake {
    pub owner: Pubkey,
    pub stake_pool: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
    pub last_points_claim_ts: i64,
    pub user_stake_bump: u8,
}

impl UserStake {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 1; // 89 bytes
}

// ============================
// TOKEN LOCK ACCOUNTS
// ============================

#[account]
pub struct TokenLock {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub lock_start: i64,
    pub lock_end: i64,
    pub lock_index: u8,
    pub released: bool,
    pub token_lock_bump: u8,
}

impl TokenLock {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 1 + 1 + 1; // 91 bytes
}

// ============================
// STAKING EVENTS
// ============================

#[event]
pub struct StakePoolInitialized {
    pub pool: Pubkey,
    pub admin: Pubkey,
    pub token_mint: Pubkey,
    pub min_stake: u64,
    pub points_rate: u64,
}

#[event]
pub struct TokensStaked {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
}

#[event]
pub struct TokensUnstaked {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
}

#[event]
pub struct StakePositionClosed {
    pub pool: Pubkey,
    pub user: Pubkey,
}

// ============================
// LOCK EVENTS
// ============================

#[event]
pub struct LockCreated {
    pub lock: Pubkey,
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub lock_end: i64,
    pub lock_index: u8,
}

#[event]
pub struct LockExtended {
    pub lock: Pubkey,
    pub new_lock_end: i64,
}

#[event]
pub struct LockReleased {
    pub lock: Pubkey,
    pub creator: Pubkey,
    pub amount: u64,
}
