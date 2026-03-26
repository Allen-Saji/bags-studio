use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod merkle_proof;
pub mod state;

use instructions::*;

declare_id!("4YHDw9yod478JPTNd7CbSbSX9JPp4PpgsjxRSiz8PqJR");

#[program]
pub mod reward_vault {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        instructions::initialize_vault::handler(ctx)
    }

    pub fn update_distribution(
        ctx: Context<UpdateDistribution>,
        new_root: [u8; 32],
        total_distribution: u64,
    ) -> Result<()> {
        instructions::update_distribution::handler(ctx, new_root, total_distribution)
    }

    pub fn claim(ctx: Context<Claim>, amount: u64, proof: Vec<[u8; 32]>) -> Result<()> {
        instructions::claim::handler(ctx, amount, proof)
    }

    pub fn close_claim_status(ctx: Context<CloseClaimStatus>) -> Result<()> {
        instructions::close_claim_status::handler(ctx)
    }
}
