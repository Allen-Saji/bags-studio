use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::state::{StakePool, UserStake, TokensUnstaked};
use crate::error::RewardVaultError;

#[derive(Accounts)]
pub struct Unstake<'info> {
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

    #[account(
        mut,
        seeds = [b"stake_vault", token_mint.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = stake_pool,
    )]
    pub stake_vault: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::mint = token_mint,
        token::authority = owner,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    pub owner: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(ctx: Context<Unstake>, amount: u64) -> Result<()> {
    require!(amount > 0, RewardVaultError::ZeroAmount);
    require!(
        ctx.accounts.user_stake.amount >= amount,
        RewardVaultError::InsufficientStake
    );

    // Transfer tokens from stake vault back to user (PDA signer)
    let mint_key = ctx.accounts.stake_pool.token_mint;
    let signer_seeds: &[&[u8]] = &[
        b"stake_pool",
        mint_key.as_ref(),
        &[ctx.accounts.stake_pool.stake_pool_bump],
    ];

    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.stake_vault.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.stake_pool.to_account_info(),
            },
            &[signer_seeds],
        ),
        amount,
        ctx.accounts.token_mint.decimals,
    )?;

    // Update user stake — forfeit current epoch points by resetting claim timestamp
    let clock = Clock::get()?;
    let user_stake = &mut ctx.accounts.user_stake;
    user_stake.amount = user_stake.amount
        .checked_sub(amount)
        .ok_or(RewardVaultError::ArithmeticOverflow)?;
    user_stake.last_points_claim_ts = clock.unix_timestamp; // forfeit current epoch
    if user_stake.amount == 0 {
        user_stake.staked_at = 0;
    }

    // Update pool total
    let pool_key = ctx.accounts.stake_pool.key();
    let pool = &mut ctx.accounts.stake_pool;
    pool.total_staked = pool.total_staked
        .checked_sub(amount)
        .ok_or(RewardVaultError::ArithmeticOverflow)?;

    emit!(TokensUnstaked {
        pool: pool_key,
        user: ctx.accounts.owner.key(),
        amount,
        total_staked: pool.total_staked,
    });

    Ok(())
}
