use anchor_lang::prelude::*;
use crate::state::{StakePool, UserStake};

#[derive(Accounts)]
pub struct OpenStakePosition<'info> {
    #[account(
        seeds = [b"stake_pool", stake_pool.token_mint.as_ref()],
        bump = stake_pool.stake_pool_bump,
    )]
    pub stake_pool: Account<'info, StakePool>,

    #[account(
        init,
        seeds = [b"user_stake", stake_pool.key().as_ref(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + UserStake::LEN,
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<OpenStakePosition>) -> Result<()> {
    let clock = Clock::get()?;
    let user_stake = &mut ctx.accounts.user_stake;
    user_stake.owner = ctx.accounts.owner.key();
    user_stake.stake_pool = ctx.accounts.stake_pool.key();
    user_stake.amount = 0;
    user_stake.staked_at = 0;
    user_stake.last_points_claim_ts = clock.unix_timestamp;
    user_stake.user_stake_bump = ctx.bumps.user_stake;

    Ok(())
}
