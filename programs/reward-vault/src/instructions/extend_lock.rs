use anchor_lang::prelude::*;
use crate::state::{TokenLock, LockExtended};
use crate::error::RewardVaultError;

#[derive(Accounts)]
#[instruction(additional_secs: i64)]
pub struct ExtendLock<'info> {
    #[account(
        mut,
        seeds = [
            b"token_lock",
            token_lock.token_mint.as_ref(),
            creator.key().as_ref(),
            &[token_lock.lock_index],
        ],
        bump = token_lock.token_lock_bump,
        has_one = creator,
    )]
    pub token_lock: Account<'info, TokenLock>,

    pub creator: Signer<'info>,
}

pub fn handler(ctx: Context<ExtendLock>, additional_secs: i64) -> Result<()> {
    require!(!ctx.accounts.token_lock.released, RewardVaultError::AlreadyReleased);
    require!(additional_secs > 0, RewardVaultError::InvalidExtension);

    let lock_key = ctx.accounts.token_lock.key();
    let lock = &mut ctx.accounts.token_lock;
    lock.lock_end = lock.lock_end
        .checked_add(additional_secs)
        .ok_or(RewardVaultError::ArithmeticOverflow)?;

    emit!(LockExtended {
        lock: lock_key,
        new_lock_end: lock.lock_end,
    });

    Ok(())
}
