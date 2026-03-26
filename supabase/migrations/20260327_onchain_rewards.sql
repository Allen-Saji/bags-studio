-- Add on-chain reward vault fields

-- Vault: store PDA addresses and on-chain status
ALTER TABLE reward_vaults ADD COLUMN IF NOT EXISTS vault_state_pda text;
ALTER TABLE reward_vaults ADD COLUMN IF NOT EXISTS treasury_pda text;
ALTER TABLE reward_vaults ADD COLUMN IF NOT EXISTS on_chain boolean DEFAULT false;

-- Epochs: store merkle root and expiry
ALTER TABLE reward_epochs ADD COLUMN IF NOT EXISTS merkle_root text;
ALTER TABLE reward_epochs ADD COLUMN IF NOT EXISTS epoch_ends_at timestamptz;
ALTER TABLE reward_epochs ADD COLUMN IF NOT EXISTS total_allocation_lamports numeric DEFAULT 0;

-- Claims: store merkle proof for on-chain verification
ALTER TABLE reward_claims ADD COLUMN IF NOT EXISTS merkle_proof jsonb;
ALTER TABLE reward_claims ADD COLUMN IF NOT EXISTS on_chain_epoch numeric;
