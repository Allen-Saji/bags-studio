use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::state::{StakePool, UserStake, TokensStaked};
use crate::error::RewardVaultError;

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        mut,
        seeds = [b"stake_pool", stake_pool.token_mint.as_ref()],
        bump = stake_pool.stake_pool_bump,
        has_one = token_mint,
    )]
    pub stake_pool: Account<'info, StakePool>,

    #[account(
        mut,
        seeds = [b"user_stake", stake_pool.key().as_ref(), owner.key().as_ref()],
        bump = user_stake.user_stake_bump,
        has_one = owner,
        has_one = stake_pool,
    )]
    pub user_stake: Account<'info, UserStake>,

    /// Stake vault — holds all staked tokens for this pool
    #[account(
        mut,
        seeds = [b"stake_vault", token_mint.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = stake_pool,
    )]
    pub stake_vault: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    /// User's token account to transfer from
    #[account(
        mut,
        token::mint = token_mint,
        token::authority = owner,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    pub owner: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(ctx: Context<Stake>, amount: u64) -> Result<()> {
    require!(amount > 0, RewardVaultError::ZeroAmount);

    let pool = &ctx.accounts.stake_pool;
    let user_stake = &ctx.accounts.user_stake;

    // Check minimum stake: total position must meet min after this deposit
    let new_total = user_stake.amount
        .checked_add(amount)
        .ok_or(RewardVaultError::ArithmeticOverflow)?;
    require!(new_total >= pool.min_stake_amount, RewardVaultError::BelowMinStake);

    // Transfer tokens from user to stake vault
    token_interface::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.user_token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.stake_vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.token_mint.decimals,
    )?;

    // Update user stake
    let clock = Clock::get()?;
    let user_stake = &mut ctx.accounts.user_stake;
    let was_zero = user_stake.amount == 0;
    user_stake.amount = new_total;
    if was_zero {
        user_stake.staked_at = clock.unix_timestamp;
    }

    // Update pool total
    let pool_key = ctx.accounts.stake_pool.key();
    let pool = &mut ctx.accounts.stake_pool;
    pool.total_staked = pool.total_staked
        .checked_add(amount)
        .ok_or(RewardVaultError::ArithmeticOverflow)?;

    emit!(TokensStaked {
        pool: pool_key,
        user: ctx.accounts.owner.key(),
        amount,
        total_staked: pool.total_staked,
    });

    Ok(())
}
