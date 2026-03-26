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
