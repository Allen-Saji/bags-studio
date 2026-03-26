use anchor_lang::prelude::*;
use crate::state::{VaultState, ClaimStatus, ClaimStatusClosed};
use crate::error::RewardVaultError;

#[derive(Accounts)]
pub struct CloseClaimStatus<'info> {
    #[account(
        seeds = [b"vault_state", vault_state.token_mint.as_ref()],
        bump = vault_state.vault_state_bump,
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

    /// Anyone can call this — permissionless cleanup after epoch ends
    pub caller: Signer<'info>,
}

pub fn handler(ctx: Context<CloseClaimStatus>) -> Result<()> {
    let vault = &ctx.accounts.vault_state;
    let claim = &ctx.accounts.claim_status;
    let clock = Clock::get()?;

    // Can only close claims from completed epochs
    // Either the epoch is in the past, or the current epoch's end time has passed
    require!(
        claim.claim_epoch < vault.current_epoch
            || (claim.claim_epoch == vault.current_epoch && clock.unix_timestamp >= vault.epoch_ends_at),
        RewardVaultError::EpochNotEnded
    );

    emit!(ClaimStatusClosed {
        vault: ctx.accounts.vault_state.key(),
        claimant: claim.claimant,
        epoch: claim.claim_epoch,
    });

    Ok(())
}
