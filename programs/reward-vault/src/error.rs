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
}
