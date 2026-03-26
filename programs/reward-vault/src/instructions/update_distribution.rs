use anchor_lang::prelude::*;
use crate::state::{VaultState, DistributionUpdated};
use crate::error::RewardVaultError;

const EPOCH_DURATION: i64 = 7 * 24 * 60 * 60; // 7 days in seconds

#[derive(Accounts)]
pub struct UpdateDistribution<'info> {
    #[account(
        mut,
        seeds = [b"vault_state", vault_state.token_mint.as_ref()],
        bump = vault_state.vault_state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    /// Only the admin can update the distribution — prevents arbitrary root injection
    #[account(
        constraint = vault_state.admin == admin.key() @ RewardVaultError::Unauthorized
    )]
    pub admin: Signer<'info>,
}

pub fn handler(
    ctx: Context<UpdateDistribution>,
    new_root: [u8; 32],
    total_distribution: u64,
) -> Result<()> {
    let vault_key = ctx.accounts.vault_state.key();
    let vault = &mut ctx.accounts.vault_state;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // First epoch (epoch_ends_at == 0) always allowed, otherwise must be expired
    require!(
        vault.epoch_ends_at == 0 || now >= vault.epoch_ends_at,
        RewardVaultError::EpochNotExpired
    );

    vault.current_epoch = vault
        .current_epoch
        .checked_add(1)
        .ok_or(RewardVaultError::ArithmeticOverflow)?;
    vault.merkle_root = new_root;
    vault.total_distributed = vault
        .total_distributed
        .checked_add(total_distribution)
        .ok_or(RewardVaultError::ArithmeticOverflow)?;
    vault.epoch_created_at = now;
    vault.epoch_ends_at = now
        .checked_add(EPOCH_DURATION)
        .ok_or(RewardVaultError::ArithmeticOverflow)?;

    emit!(DistributionUpdated {
        vault: vault_key,
        epoch: vault.current_epoch,
        merkle_root: new_root,
        total_distribution,
    });

    Ok(())
}
