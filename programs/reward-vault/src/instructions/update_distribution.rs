use anchor_lang::prelude::*;
use crate::state::VaultState;
use crate::error::RewardVaultError;

const EPOCH_DURATION: i64 = 7 * 24 * 60 * 60; // 7 days in seconds

#[derive(Accounts)]
pub struct UpdateDistribution<'info> {
    #[account(
        mut,
        seeds = [b"vault_state", vault_state.token_mint.as_ref()],
        bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    /// Anyone can trigger a distribution — permissionless
    pub caller: Signer<'info>,
}

pub fn handler(
    ctx: Context<UpdateDistribution>,
    new_root: [u8; 32],
    total_distribution: u64,
) -> Result<()> {
    let vault = &mut ctx.accounts.vault_state;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // First epoch (epoch_ends_at == 0) always allowed, otherwise must be expired
    require!(
        vault.epoch_ends_at == 0 || now >= vault.epoch_ends_at,
        RewardVaultError::EpochNotExpired
    );

    vault.current_epoch = vault.current_epoch.checked_add(1).unwrap();
    vault.merkle_root = new_root;
    vault.total_distributed = vault
        .total_distributed
        .checked_add(total_distribution)
        .unwrap();
    vault.epoch_created_at = now;
    vault.epoch_ends_at = now + EPOCH_DURATION;

    msg!(
        "Distribution updated: epoch={}, root={:?}",
        vault.current_epoch,
        &new_root[..8]
    );

    Ok(())
}
