use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::state::{TokenLock, LockCreated};
use crate::error::RewardVaultError;

#[derive(Accounts)]
#[instruction(amount: u64, lock_duration_secs: i64, lock_index: u8)]
pub struct CreateLock<'info> {
    #[account(
        init,
        seeds = [b"token_lock", token_mint.key().as_ref(), creator.key().as_ref(), &[lock_index]],
        bump,
        payer = creator,
        space = 8 + TokenLock::LEN,
    )]
    pub token_lock: Box<Account<'info, TokenLock>>,

    /// Token vault for this specific lock
    #[account(
        init,
        payer = creator,
        token::mint = token_mint,
        token::authority = token_lock,
        seeds = [b"lock_vault", token_mint.key().as_ref(), creator.key().as_ref(), &[lock_index]],
        bump,
    )]
    pub lock_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// Creator's token account to transfer from
    #[account(
        mut,
        token::mint = token_mint,
        token::authority = creator,
    )]
    pub creator_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateLock>,
    amount: u64,
    lock_duration_secs: i64,
    lock_index: u8,
) -> Result<()> {
    require!(amount > 0, RewardVaultError::ZeroAmount);
    require!(lock_duration_secs > 0, RewardVaultError::InvalidExtension);
    require!(lock_index <= 10, RewardVaultError::InvalidLockIndex);

    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    let lock_end = now
        .checked_add(lock_duration_secs)
        .ok_or(RewardVaultError::ArithmeticOverflow)?;

    // Transfer tokens from creator to lock vault
    token_interface::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.creator_token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.lock_vault.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.token_mint.decimals,
    )?;

    // Populate lock state
    let lock_key = ctx.accounts.token_lock.key();
    let lock = &mut ctx.accounts.token_lock;
    lock.creator = ctx.accounts.creator.key();
    lock.token_mint = ctx.accounts.token_mint.key();
    lock.amount = amount;
    lock.lock_start = now;
    lock.lock_end = lock_end;
    lock.lock_index = lock_index;
    lock.released = false;
    lock.token_lock_bump = ctx.bumps.token_lock;

    emit!(LockCreated {
        lock: lock_key,
        creator: lock.creator,
        token_mint: lock.token_mint,
        amount,
        lock_end,
        lock_index,
    });

    Ok(())
}
