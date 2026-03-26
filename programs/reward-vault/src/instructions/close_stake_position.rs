use anchor_lang::prelude::*;
use crate::state::{StakePool, UserStake, StakePositionClosed};
use crate::error::RewardVaultError;

#[derive(Accounts)]
pub struct CloseStakePosition<'info> {
    #[account(
        seeds = [b"stake_pool", stake_pool.token_mint.as_ref()],
        bump = stake_pool.stake_pool_bump,
    )]
    pub stake_pool: Account<'info, StakePool>,

    #[account(
        mut,
        close = owner,
        seeds = [b"user_stake", stake_pool.key().as_ref(), owner.key().as_ref()],
        bump = user_stake.user_stake_bump,
        has_one = owner,
        has_one = stake_pool,
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn handler(ctx: Context<CloseStakePosition>) -> Result<()> {
    require!(
        ctx.accounts.user_stake.amount == 0,
        RewardVaultError::StakeNotEmpty
    );

    emit!(StakePositionClosed {
        pool: ctx.accounts.stake_pool.key(),
        user: ctx.accounts.owner.key(),
    });

    Ok(())
}
