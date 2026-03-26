import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';

// Program ID — update after deployment
export const REWARD_VAULT_PROGRAM_ID = new PublicKey(
  '4YHDw9yod478JPTNd7CbSbSX9JPp4PpgsjxRSiz8PqJR'
);

// Anchor discriminators (first 8 bytes of sha256("global:<instruction_name>"))
import { createHash } from 'crypto';

function ixDiscriminator(name: string): Buffer {
  return createHash('sha256')
    .update(`global:${name}`)
    .digest()
    .subarray(0, 8);
}

const IX_INITIALIZE_VAULT = ixDiscriminator('initialize_vault');
const IX_UPDATE_DISTRIBUTION = ixDiscriminator('update_distribution');
const IX_CLAIM = ixDiscriminator('claim');
const IX_CLOSE_CLAIM_STATUS = ixDiscriminator('close_claim_status');
const IX_INITIALIZE_STAKE_POOL = ixDiscriminator('initialize_stake_pool');
const IX_OPEN_STAKE_POSITION = ixDiscriminator('open_stake_position');
const IX_STAKE = ixDiscriminator('stake');
const IX_UNSTAKE = ixDiscriminator('unstake');
const IX_CLOSE_STAKE_POSITION = ixDiscriminator('close_stake_position');
const IX_CREATE_LOCK = ixDiscriminator('create_lock');
const IX_EXTEND_LOCK = ixDiscriminator('extend_lock');
const IX_RELEASE_LOCK = ixDiscriminator('release_lock');

// --- PDA derivation ---

export function getVaultStatePDA(tokenMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault_state'), tokenMint.toBuffer()],
    REWARD_VAULT_PROGRAM_ID,
  );
}

export function getTreasuryPDA(tokenMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('treasury'), tokenMint.toBuffer()],
    REWARD_VAULT_PROGRAM_ID,
  );
}

export function getClaimStatusPDA(
  vaultState: PublicKey,
  epoch: number,
  claimant: PublicKey,
): [PublicKey, number] {
  const epochBuf = Buffer.alloc(8);
  epochBuf.writeBigUInt64LE(BigInt(epoch));
  return PublicKey.findProgramAddressSync(
    [Buffer.from('claim'), vaultState.toBuffer(), epochBuf, claimant.toBuffer()],
    REWARD_VAULT_PROGRAM_ID,
  );
}

// --- Instruction builders ---

export function buildInitializeVaultIx(
  admin: PublicKey,
  tokenMint: PublicKey,
): TransactionInstruction {
  const [vaultState] = getVaultStatePDA(tokenMint);
  const [treasury] = getTreasuryPDA(tokenMint);

  const data = IX_INITIALIZE_VAULT;

  return new TransactionInstruction({
    keys: [
      { pubkey: vaultState, isSigner: false, isWritable: true },
      { pubkey: treasury, isSigner: false, isWritable: false },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: admin, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID,
    data,
  });
}

export function buildUpdateDistributionIx(
  vaultState: PublicKey,
  tokenMint: PublicKey,
  caller: PublicKey,
  newRoot: Buffer,
  totalDistribution: bigint,
): TransactionInstruction {
  // Data: discriminator (8) + new_root (32) + total_distribution (8)
  const data = Buffer.alloc(8 + 32 + 8);
  IX_UPDATE_DISTRIBUTION.copy(data, 0);
  newRoot.copy(data, 8);
  data.writeBigUInt64LE(totalDistribution, 40);

  return new TransactionInstruction({
    keys: [
      { pubkey: vaultState, isSigner: false, isWritable: true },
      { pubkey: caller, isSigner: true, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID,
    data,
  });
}

export function buildClaimIx(
  vaultState: PublicKey,
  tokenMint: PublicKey,
  treasury: PublicKey,
  claimant: PublicKey,
  epoch: number,
  amount: bigint,
  proof: Buffer[],
): TransactionInstruction {
  const [claimStatus] = getClaimStatusPDA(vaultState, epoch, claimant);

  // Data: discriminator (8) + amount (8) + proof_len (4) + proof (32 * n)
  const proofLen = proof.length;
  const data = Buffer.alloc(8 + 8 + 4 + 32 * proofLen);
  IX_CLAIM.copy(data, 0);
  data.writeBigUInt64LE(amount, 8);
  data.writeUInt32LE(proofLen, 16);
  for (let i = 0; i < proofLen; i++) {
    proof[i].copy(data, 20 + i * 32);
  }

  return new TransactionInstruction({
    keys: [
      { pubkey: vaultState, isSigner: false, isWritable: false },
      { pubkey: treasury, isSigner: false, isWritable: true },
      { pubkey: claimStatus, isSigner: false, isWritable: true },
      { pubkey: claimant, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID,
    data,
  });
}

export function buildCloseClaimStatusIx(
  vaultState: PublicKey,
  tokenMint: PublicKey,
  claimStatus: PublicKey,
  claimant: PublicKey,
  caller: PublicKey,
): TransactionInstruction {
  const data = IX_CLOSE_CLAIM_STATUS;

  return new TransactionInstruction({
    keys: [
      { pubkey: vaultState, isSigner: false, isWritable: false },
      { pubkey: claimStatus, isSigner: false, isWritable: true },
      { pubkey: claimant, isSigner: false, isWritable: true },
      { pubkey: caller, isSigner: true, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID,
    data,
  });
}

// --- Staking PDA derivation ---

export function getStakePoolPDA(tokenMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('stake_pool'), tokenMint.toBuffer()],
    REWARD_VAULT_PROGRAM_ID,
  );
}

export function getStakeVaultPDA(tokenMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('stake_vault'), tokenMint.toBuffer()],
    REWARD_VAULT_PROGRAM_ID,
  );
}

export function getUserStakePDA(stakePool: PublicKey, user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user_stake'), stakePool.toBuffer(), user.toBuffer()],
    REWARD_VAULT_PROGRAM_ID,
  );
}

export function getTokenLockPDA(tokenMint: PublicKey, creator: PublicKey, lockIndex: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('token_lock'), tokenMint.toBuffer(), creator.toBuffer(), Buffer.from([lockIndex])],
    REWARD_VAULT_PROGRAM_ID,
  );
}

export function getLockVaultPDA(tokenMint: PublicKey, creator: PublicKey, lockIndex: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('lock_vault'), tokenMint.toBuffer(), creator.toBuffer(), Buffer.from([lockIndex])],
    REWARD_VAULT_PROGRAM_ID,
  );
}

// --- Staking instruction builders ---

export function buildInitializeStakePoolIx(
  vaultState: PublicKey, tokenMint: PublicKey, admin: PublicKey, tokenProgram: PublicKey,
  minStake: bigint, pointsRate: bigint,
): TransactionInstruction {
  const [stakePool] = getStakePoolPDA(tokenMint);
  const [stakeVault] = getStakeVaultPDA(tokenMint);
  const data = Buffer.alloc(8 + 8 + 8);
  IX_INITIALIZE_STAKE_POOL.copy(data, 0);
  data.writeBigUInt64LE(minStake, 8);
  data.writeBigUInt64LE(pointsRate, 16);
  return new TransactionInstruction({
    keys: [
      { pubkey: vaultState, isSigner: false, isWritable: false },
      { pubkey: stakePool, isSigner: false, isWritable: true },
      { pubkey: stakeVault, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: admin, isSigner: true, isWritable: true },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID, data,
  });
}

export function buildOpenStakePositionIx(stakePool: PublicKey, owner: PublicKey): TransactionInstruction {
  const [userStake] = getUserStakePDA(stakePool, owner);
  return new TransactionInstruction({
    keys: [
      { pubkey: stakePool, isSigner: false, isWritable: false },
      { pubkey: userStake, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID, data: IX_OPEN_STAKE_POSITION,
  });
}

export function buildStakeIx(
  stakePool: PublicKey, tokenMint: PublicKey, owner: PublicKey,
  userTokenAccount: PublicKey, tokenProgram: PublicKey, amount: bigint,
): TransactionInstruction {
  const [userStake] = getUserStakePDA(stakePool, owner);
  const [stakeVault] = getStakeVaultPDA(tokenMint);
  const data = Buffer.alloc(8 + 8);
  IX_STAKE.copy(data, 0);
  data.writeBigUInt64LE(amount, 8);
  return new TransactionInstruction({
    keys: [
      { pubkey: stakePool, isSigner: false, isWritable: true },
      { pubkey: userStake, isSigner: false, isWritable: true },
      { pubkey: stakeVault, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID, data,
  });
}

export function buildUnstakeIx(
  stakePool: PublicKey, tokenMint: PublicKey, owner: PublicKey,
  userTokenAccount: PublicKey, tokenProgram: PublicKey, amount: bigint,
): TransactionInstruction {
  const [userStake] = getUserStakePDA(stakePool, owner);
  const [stakeVault] = getStakeVaultPDA(tokenMint);
  const data = Buffer.alloc(8 + 8);
  IX_UNSTAKE.copy(data, 0);
  data.writeBigUInt64LE(amount, 8);
  return new TransactionInstruction({
    keys: [
      { pubkey: stakePool, isSigner: false, isWritable: true },
      { pubkey: userStake, isSigner: false, isWritable: true },
      { pubkey: stakeVault, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID, data,
  });
}

// --- Lock instruction builders ---

export function buildCreateLockIx(
  tokenMint: PublicKey, creator: PublicKey, creatorTokenAccount: PublicKey,
  tokenProgram: PublicKey, amount: bigint, lockDurationSecs: bigint, lockIndex: number,
): TransactionInstruction {
  const [tokenLock] = getTokenLockPDA(tokenMint, creator, lockIndex);
  const [lockVault] = getLockVaultPDA(tokenMint, creator, lockIndex);
  const data = Buffer.alloc(8 + 8 + 8 + 1);
  IX_CREATE_LOCK.copy(data, 0);
  data.writeBigUInt64LE(amount, 8);
  data.writeBigInt64LE(lockDurationSecs, 16);
  data.writeUInt8(lockIndex, 24);
  return new TransactionInstruction({
    keys: [
      { pubkey: tokenLock, isSigner: false, isWritable: true },
      { pubkey: lockVault, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: creatorTokenAccount, isSigner: false, isWritable: true },
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID, data,
  });
}

export function buildExtendLockIx(
  tokenMint: PublicKey, creator: PublicKey, lockIndex: number, additionalSecs: bigint,
): TransactionInstruction {
  const [tokenLock] = getTokenLockPDA(tokenMint, creator, lockIndex);
  const data = Buffer.alloc(8 + 8);
  IX_EXTEND_LOCK.copy(data, 0);
  data.writeBigInt64LE(additionalSecs, 8);
  return new TransactionInstruction({
    keys: [
      { pubkey: tokenLock, isSigner: false, isWritable: true },
      { pubkey: creator, isSigner: true, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID, data,
  });
}

export function buildReleaseLockIx(
  tokenMint: PublicKey, creator: PublicKey, creatorTokenAccount: PublicKey,
  tokenProgram: PublicKey, lockIndex: number,
): TransactionInstruction {
  const [tokenLock] = getTokenLockPDA(tokenMint, creator, lockIndex);
  const [lockVault] = getLockVaultPDA(tokenMint, creator, lockIndex);
  return new TransactionInstruction({
    keys: [
      { pubkey: tokenLock, isSigner: false, isWritable: true },
      { pubkey: lockVault, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: creatorTokenAccount, isSigner: false, isWritable: true },
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
    ],
    programId: REWARD_VAULT_PROGRAM_ID, data: IX_RELEASE_LOCK,
  });
}
