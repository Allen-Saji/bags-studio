use anchor_lang::prelude::*;
use crate::state::{VaultState, ClaimStatus};
use crate::error::RewardVaultError;
use crate::merkle_proof::{verify, compute_leaf, MAX_PROOF_DEPTH};

#[derive(Accounts)]
#[instruction(amount: u64, proof: Vec<[u8; 32]>)]
pub struct Claim<'info> {
    #[account(
        seeds = [b"vault_state", vault_state.token_mint.as_ref()],
        bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    /// The treasury PDA holding SOL — lamports will be deducted
    /// CHECK: Verified via seeds constraint — this is the program-owned treasury PDA.
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
    require!(proof.len() <= MAX_PROOF_DEPTH, RewardVaultError::ProofTooLong);

    let vault = &ctx.accounts.vault_state;
    let treasury = &ctx.accounts.treasury;

    // Verify merkle proof
    let leaf = compute_leaf(
        &ctx.accounts.claimant.key().to_bytes(),
        amount,
    );
    require!(
        verify(&proof, &vault.merkle_root, leaf),
        RewardVaultError::InvalidProof
    );

    // Check treasury has enough SOL
    let treasury_lamports = treasury.lamports();
    require!(
        treasury_lamports >= amount,
        RewardVaultError::InsufficientFunds
    );

    // Transfer SOL from treasury PDA to claimant via lamport manipulation
    let treasury_info = ctx.accounts.treasury.to_account_info();
    let claimant_info = ctx.accounts.claimant.to_account_info();

    **treasury_info.try_borrow_mut_lamports()? -= amount;
    **claimant_info.try_borrow_mut_lamports()? += amount;

    // Mark as claimed
    let claim_status = &mut ctx.accounts.claim_status;
    claim_status.claimed = true;
    claim_status.claim_epoch = vault.current_epoch;
    claim_status.claimant = ctx.accounts.claimant.key();
    claim_status.amount = amount;

    msg!(
        "Claimed {} lamports for epoch {}",
        amount,
        vault.current_epoch
    );

    Ok(())
}
