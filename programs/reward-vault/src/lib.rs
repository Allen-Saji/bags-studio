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

    // --- Reward Vault ---

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

    // --- Staking ---

    pub fn initialize_stake_pool(
        ctx: Context<InitializeStakePool>,
        min_stake: u64,
        points_rate: u64,
    ) -> Result<()> {
        instructions::initialize_stake_pool::handler(ctx, min_stake, points_rate)
    }

    pub fn open_stake_position(ctx: Context<OpenStakePosition>) -> Result<()> {
        instructions::open_stake_position::handler(ctx)
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        instructions::stake::handler(ctx, amount)
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        instructions::unstake::handler(ctx, amount)
    }

    pub fn close_stake_position(ctx: Context<CloseStakePosition>) -> Result<()> {
        instructions::close_stake_position::handler(ctx)
    }

    // --- Creator Token Lock ---

    pub fn create_lock(
        ctx: Context<CreateLock>,
        amount: u64,
        lock_duration_secs: i64,
        lock_index: u8,
    ) -> Result<()> {
        instructions::create_lock::handler(ctx, amount, lock_duration_secs, lock_index)
    }

    pub fn extend_lock(ctx: Context<ExtendLock>, additional_secs: i64) -> Result<()> {
        instructions::extend_lock::handler(ctx, additional_secs)
    }

    pub fn release_lock(ctx: Context<ReleaseLock>) -> Result<()> {
        instructions::release_lock::handler(ctx)
    }
}
