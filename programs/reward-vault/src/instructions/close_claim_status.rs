use anchor_lang::prelude::*;
use crate::state::{VaultState, ClaimStatus};
use crate::error::RewardVaultError;

#[derive(Accounts)]
pub struct CloseClaimStatus<'info> {
    #[account(
        seeds = [b"vault_state", vault_state.token_mint.as_ref()],
        bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        close = claimant,
        seeds = [
            b"claim",
            vault_state.key().as_ref(),
            &claim_status.claim_epoch.to_le_bytes(),
            claim_status.claimant.as_ref(),
        ],
        bump,
        has_one = claimant,
    )]
    pub claim_status: Account<'info, ClaimStatus>,

    /// The original claimant who paid rent — receives rent refund
    /// CHECK: Validated by has_one constraint on claim_status
    #[account(mut)]
    pub claimant: SystemAccount<'info>,

    /// Anyone can call this — permissionless cleanup
    pub caller: Signer<'info>,
}

pub fn handler(ctx: Context<CloseClaimStatus>) -> Result<()> {
    let vault = &ctx.accounts.vault_state;
    let claim = &ctx.accounts.claim_status;
    let clock = Clock::get()?;

    // Can only close after the epoch has ended
    require!(
        clock.unix_timestamp >= vault.epoch_ends_at,
        RewardVaultError::EpochNotEnded
    );

    // The claim must be from a past epoch (not the current one if it hasn't ended)
    require!(
        claim.claim_epoch < vault.current_epoch || clock.unix_timestamp >= vault.epoch_ends_at,
        RewardVaultError::EpochNotEnded
    );

    msg!(
        "Closed claim status for epoch {}, refunding rent to {}",
        claim.claim_epoch,
        claim.claimant
    );

    Ok(())
}
