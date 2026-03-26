import { createHash } from 'crypto';
import { PublicKey } from '@solana/web3.js';

/**
 * Off-chain merkle tree for reward distribution.
 * Matches the on-chain verification in programs/reward-vault/src/merkle_proof.rs
 *
 * Leaf: sha256([0x00, sha256([wallet_32bytes, amount_u64_le])])
 * Internal: sha256([0x01, min(L,R), max(L,R)])
 */

function sha256(data: Buffer): Buffer {
  return createHash('sha256').update(data).digest();
}

function computeLeaf(wallet: PublicKey, amount: bigint): Buffer {
  const walletBytes = wallet.toBuffer();
  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(amount);
  const inner = sha256(Buffer.concat([walletBytes, amountBuf]));
  return sha256(Buffer.concat([Buffer.from([0x00]), inner]));
}

function computeInternalNode(left: Buffer, right: Buffer): Buffer {
  // Sorted pair ordering — smaller hash always on left
  const [l, r] = Buffer.compare(left, right) <= 0 ? [left, right] : [right, left];
  return sha256(Buffer.concat([Buffer.from([0x01]), l, r]));
}

export interface MerkleEntry {
  wallet: string; // base58 pubkey
  amount: bigint; // lamports
}

export interface MerkleTreeResult {
  root: Buffer;
  proofs: Map<string, Buffer[]>;
  leafCount: number;
}

/**
 * Build a merkle tree from reward entries.
 * Returns the root and proofs for each wallet.
 */
export function buildMerkleTree(entries: MerkleEntry[]): MerkleTreeResult {
  if (entries.length === 0) {
    return {
      root: Buffer.alloc(32),
      proofs: new Map(),
      leafCount: 0,
    };
  }

  // Compute leaves and sort them for deterministic tree
  const leaves = entries.map(e => ({
    wallet: e.wallet,
    leaf: computeLeaf(new PublicKey(e.wallet), e.amount),
  }));

  // Sort leaves by hash value for deterministic ordering
  leaves.sort((a, b) => Buffer.compare(a.leaf, b.leaf));

  // Build tree bottom-up, tracking proofs
  const proofMap = new Map<string, Buffer[]>();
  for (const l of leaves) {
    proofMap.set(l.wallet, []);
  }

  let currentLevel = leaves.map(l => ({ hash: l.leaf, wallets: [l.wallet] }));

  while (currentLevel.length > 1) {
    const nextLevel: { hash: Buffer; wallets: string[] }[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1];
        const parent = computeInternalNode(left.hash, right.hash);

        // Add sibling to each wallet's proof
        for (const w of left.wallets) {
          proofMap.get(w)!.push(right.hash);
        }
        for (const w of right.wallets) {
          proofMap.get(w)!.push(left.hash);
        }

        nextLevel.push({
          hash: parent,
          wallets: [...left.wallets, ...right.wallets],
        });
      } else {
        // Odd node — promote to next level without a sibling
        nextLevel.push(currentLevel[i]);
      }
    }

    currentLevel = nextLevel;
  }

  return {
    root: currentLevel[0].hash,
    proofs: proofMap,
    leafCount: leaves.length,
  };
}

/**
 * Verify a proof off-chain (for testing).
 */
export function verifyProof(
  proof: Buffer[],
  root: Buffer,
  wallet: string,
  amount: bigint,
): boolean {
  let computed = computeLeaf(new PublicKey(wallet), amount);

  for (const node of proof) {
    computed = computeInternalNode(computed, node);
  }

  return computed.equals(root);
}

/**
 * Serialize proof for on-chain use — returns array of 32-byte hex strings.
 */
export function serializeProof(proof: Buffer[]): number[][] {
  return proof.map(p => Array.from(p));
}

/**
 * Serialize proof as JSON-storable format (hex strings).
 */
export function proofToHex(proof: Buffer[]): string[] {
  return proof.map(p => p.toString('hex'));
}

/**
 * Deserialize proof from hex strings.
 */
export function proofFromHex(hexProof: string[]): Buffer[] {
  return hexProof.map(h => Buffer.from(h, 'hex'));
}
