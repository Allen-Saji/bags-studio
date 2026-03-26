use anchor_lang::prelude::*;

#[error_code]
pub enum RewardVaultError {
    #[msg("Invalid merkle proof")]
    InvalidProof,

    #[msg("Current epoch has not expired yet")]
    EpochNotExpired,

    #[msg("Insufficient funds in treasury")]
    InsufficientFunds,

    #[msg("Unauthorized — only admin can perform this action")]
    Unauthorized,

    #[msg("Claim status epoch does not match — cannot close yet")]
    EpochMismatch,

    #[msg("Epoch has not ended — cannot close claim status yet")]
    EpochNotEnded,

    #[msg("Proof exceeds maximum depth")]
    ProofTooLong,

    #[msg("Claim amount must be greater than zero")]
    ZeroAmount,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Stake amount below minimum")]
    BelowMinStake,

    #[msg("Insufficient staked balance")]
    InsufficientStake,

    #[msg("Lock has not expired yet")]
    LockNotExpired,

    #[msg("Lock already released")]
    AlreadyReleased,

    #[msg("Extension must increase lock duration")]
    InvalidExtension,

    #[msg("Lock index out of range (max 10)")]
    InvalidLockIndex,

    #[msg("Stake position is not empty — unstake first")]
    StakeNotEmpty,
}
