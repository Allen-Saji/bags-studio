use anchor_lang::prelude::*;
use crate::state::{VaultState, ClaimStatus, RewardClaimed};
use crate::error::RewardVaultError;
use crate::merkle_proof::{verify, compute_leaf, MAX_PROOF_DEPTH};

#[derive(Accounts)]
#[instruction(amount: u64, proof: Vec<[u8; 32]>)]
pub struct Claim<'info> {
    #[account(
        seeds = [b"vault_state", vault_state.token_mint.as_ref()],
        bump = vault_state.vault_state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    /// The treasury PDA holding SOL — lamports will be deducted
    #[account(
        mut,
        seeds = [b"treasury", vault_state.token_mint.as_ref()],
        bump = vault_state.treasury_bump,
    )]
    pub treasury: SystemAccount<'info>,

    /// ClaimStatus PDA — init on first claim, prevents double-claiming
    #[account(
        init,
        seeds = [
            b"claim",
            vault_state.key().as_ref(),
            &vault_state.current_epoch.to_le_bytes(),
            claimant.key().as_ref(),
        ],
        bump,
        payer = claimant,
        space = 8 + ClaimStatus::LEN,
    )]
    pub claim_status: Account<'info, ClaimStatus>,

    #[account(mut)]
    pub claimant: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Claim>, amount: u64, proof: Vec<[u8; 32]>) -> Result<()> {
    // Input validation
    require!(amount > 0, RewardVaultError::ZeroAmount);
    require!(proof.len() <= MAX_PROOF_DEPTH, RewardVaultError::ProofTooLong);

    let vault = &ctx.accounts.vault_state;

    // Verify merkle proof
    let leaf = compute_leaf(
        &ctx.accounts.claimant.key().to_bytes(),
        amount,
    );
    require!(
        verify(&proof, &vault.merkle_root, leaf),
        RewardVaultError::InvalidProof
    );

    // Check treasury has enough SOL while maintaining rent exemption
    let treasury_info = ctx.accounts.treasury.to_account_info();
    let treasury_lamports = treasury_info.lamports();
    let rent = Rent::get()?;
    let min_rent = rent.minimum_balance(0);

    // Treasury must retain enough for rent exemption after transfer
    let available = treasury_lamports.saturating_sub(min_rent);
    require!(
        available >= amount,
        RewardVaultError::InsufficientFunds
    );

    // Transfer SOL from treasury PDA to claimant via lamport manipulation
    let claimant_info = ctx.accounts.claimant.to_account_info();

    **treasury_info.try_borrow_mut_lamports()? -= amount;
    **claimant_info.try_borrow_mut_lamports()? += amount;

    // Mark as claimed
    let claim_status = &mut ctx.accounts.claim_status;
    claim_status.claimed = true;
    claim_status.claim_epoch = vault.current_epoch;
    claim_status.claimant = ctx.accounts.claimant.key();
    claim_status.amount = amount;

    emit!(RewardClaimed {
        vault: ctx.accounts.vault_state.key(),
        claimant: ctx.accounts.claimant.key(),
        amount,
        epoch: vault.current_epoch,
    });

    Ok(())
}
