use anchor_lang::prelude::*;
use crate::state::{VaultState, VaultInitialized};

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
    #[account(
        seeds = [b"treasury", token_mint.key().as_ref()],
        bump,
    )]
    pub treasury: SystemAccount<'info>,

    /// The token mint this vault is for. Not mutated, just used for PDA derivation.
    /// CHECK: We only use the key for PDA seeds — no token operations performed.
    /// Accepts any pubkey so vaults can be created for any Bags token.
    pub token_mint: UncheckedAccount<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeVault>) -> Result<()> {
    let vault_key = ctx.accounts.vault_state.key();
    let admin_key = ctx.accounts.admin.key();
    let mint_key = ctx.accounts.token_mint.key();
    let treasury_key = ctx.accounts.treasury.key();

    let vault = &mut ctx.accounts.vault_state;
    vault.admin = admin_key;
    vault.token_mint = mint_key;
    vault.vault_state_bump = ctx.bumps.vault_state;
    vault.treasury_bump = ctx.bumps.treasury;
    vault.merkle_root = [0u8; 32];
    vault.current_epoch = 0;
    vault.total_distributed = 0;
    vault.epoch_created_at = 0;
    vault.epoch_ends_at = 0;

    emit!(VaultInitialized {
        vault: vault_key,
        admin: admin_key,
        token_mint: mint_key,
        treasury: treasury_key,
    });
    Ok(())
}
