use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked, CloseAccount};
use crate::state::{TokenLock, LockReleased};
use crate::error::RewardVaultError;

#[derive(Accounts)]
pub struct ReleaseLock<'info> {
    #[account(
        mut,
        close = creator,
        seeds = [
            b"token_lock",
            token_mint.key().as_ref(),
            creator.key().as_ref(),
            &[token_lock.lock_index],
        ],
        bump = token_lock.token_lock_bump,
        has_one = creator,
        has_one = token_mint,
    )]
    pub token_lock: Box<Account<'info, TokenLock>>,

    #[account(
        mut,
        seeds = [
            b"lock_vault",
            token_mint.key().as_ref(),
            creator.key().as_ref(),
            &[token_lock.lock_index],
        ],
        bump,
        token::mint = token_mint,
        token::authority = token_lock,
    )]
    pub lock_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// Creator's token account to receive unlocked tokens
    #[account(
        mut,
        token::mint = token_mint,
        token::authority = creator,
    )]
    pub creator_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(ctx: Context<ReleaseLock>) -> Result<()> {
    let lock = &ctx.accounts.token_lock;
    require!(!lock.released, RewardVaultError::AlreadyReleased);

    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp >= lock.lock_end,
        RewardVaultError::LockNotExpired
    );

    let amount = lock.amount;
    let lock_index = lock.lock_index;
    let mint_key = lock.token_mint;
    let creator_key = lock.creator;
    let lock_bump = lock.token_lock_bump;

    // Transfer tokens from lock vault back to creator (PDA signer)
    let signer_seeds: &[&[u8]] = &[
        b"token_lock",
        mint_key.as_ref(),
        creator_key.as_ref(),
        &[lock_index],
        &[lock_bump],
    ];

    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.lock_vault.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.creator_token_account.to_account_info(),
                authority: ctx.accounts.token_lock.to_account_info(),
            },
            &[signer_seeds],
        ),
        amount,
        ctx.accounts.token_mint.decimals,
    )?;

    // Close the lock vault token account — rent back to creator
    token_interface::close_account(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.lock_vault.to_account_info(),
                destination: ctx.accounts.creator.to_account_info(),
                authority: ctx.accounts.token_lock.to_account_info(),
            },
            &[signer_seeds],
        ),
    )?;

    emit!(LockReleased {
        lock: ctx.accounts.token_lock.key(),
        creator: creator_key,
        amount,
    });

    // token_lock account is closed via `close = creator` constraint
    Ok(())
}
