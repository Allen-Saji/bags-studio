use anchor_lang::prelude::*;
use crate::state::VaultState;

#[derive(Accounts)]
#[instruction()]
pub struct InitializeVault<'info> {
    #[account(
        init,
        seeds = [b"vault_state", token_mint.key().as_ref()],
        bump,
        payer = admin,
        space = 8 + VaultState::LEN,
    )]
    pub vault_state: Account<'info, VaultState>,

    /// The treasury PDA that will hold SOL. Created as a system-owned account.
    /// CHECK: This is a PDA we derive and create — no data, just holds lamports.
    #[account(
        seeds = [b"treasury", token_mint.key().as_ref()],
        bump,
    )]
    pub treasury: SystemAccount<'info>,

    /// The token mint this vault is for. Not mutated, just used for PDA derivation.
    /// CHECK: We only use the key for PDA seeds — no token operations.
    pub token_mint: UncheckedAccount<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeVault>) -> Result<()> {
    let vault = &mut ctx.accounts.vault_state;
    vault.admin = ctx.accounts.admin.key();
    vault.token_mint = ctx.accounts.token_mint.key();
    vault.treasury_bump = ctx.bumps.treasury;
    vault.merkle_root = [0u8; 32];
    vault.current_epoch = 0;
    vault.total_distributed = 0;
    vault.epoch_created_at = 0;
    vault.epoch_ends_at = 0;

    msg!("Vault initialized for mint: {}", vault.token_mint);
    Ok(())
}
