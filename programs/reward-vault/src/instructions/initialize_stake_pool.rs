use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use crate::state::{VaultState, StakePool, StakePoolInitialized};
use crate::error::RewardVaultError;

#[derive(Accounts)]
pub struct InitializeStakePool<'info> {
    /// Existing vault — used to verify admin authority
    #[account(
        seeds = [b"vault_state", vault_state.token_mint.as_ref()],
        bump = vault_state.vault_state_bump,
        has_one = admin,
        has_one = token_mint,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        init,
        seeds = [b"stake_pool", token_mint.key().as_ref()],
        bump,
        payer = admin,
        space = 8 + StakePool::LEN,
    )]
    pub stake_pool: Account<'info, StakePool>,

    /// Token vault that holds all staked tokens
    #[account(
        init,
        payer = admin,
        token::mint = token_mint,
        token::authority = stake_pool,
        seeds = [b"stake_vault", token_mint.key().as_ref()],
        bump,
    )]
    pub stake_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeStakePool>, min_stake: u64, points_rate: u64) -> Result<()> {
    require!(min_stake > 0, RewardVaultError::ZeroAmount);
    require!(points_rate > 0, RewardVaultError::ZeroAmount);

    let pool_key = ctx.accounts.stake_pool.key();
    let pool = &mut ctx.accounts.stake_pool;
    pool.admin = ctx.accounts.admin.key();
    pool.token_mint = ctx.accounts.token_mint.key();
    pool.total_staked = 0;
    pool.min_stake_amount = min_stake;
    pool.points_per_token_per_day = points_rate;
    pool.stake_pool_bump = ctx.bumps.stake_pool;
    pool.token_decimals = ctx.accounts.token_mint.decimals;

    emit!(StakePoolInitialized {
        pool: pool_key,
        admin: pool.admin,
        token_mint: pool.token_mint,
        min_stake,
        points_rate,
    });

    Ok(())
}
