import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import { createHash } from "crypto";
import * as IDL from "../target/idl/reward_vault.json";

function sha256(data: Buffer): Buffer {
  return createHash("sha256").update(data).digest();
}

function computeLeaf(wallet: PublicKey, amount: bigint): Buffer {
  const walletBytes = wallet.toBuffer();
  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(amount);
  const inner = sha256(Buffer.concat([walletBytes, amountBuf]));
  return sha256(Buffer.concat([Buffer.from([0x00]), inner]));
}

function computeInternalNode(left: Buffer, right: Buffer): Buffer {
  const [l, r] = Buffer.compare(left, right) <= 0 ? [left, right] : [right, left];
  return sha256(Buffer.concat([Buffer.from([0x01]), l, r]));
}

interface MerkleEntry {
  wallet: PublicKey;
  amount: bigint;
}

function buildMerkleTree(entries: MerkleEntry[]): { root: Buffer; proofs: Map<string, Buffer[]> } {
  const leaves = entries.map(e => ({
    key: e.wallet.toBase58(),
    leaf: computeLeaf(e.wallet, e.amount),
  }));
  leaves.sort((a, b) => Buffer.compare(a.leaf, b.leaf));

  const proofMap = new Map<string, Buffer[]>();
  for (const l of leaves) proofMap.set(l.key, []);

  let currentLevel = leaves.map(l => ({ hash: l.leaf, keys: [l.key] }));

  while (currentLevel.length > 1) {
    const nextLevel: { hash: Buffer; keys: string[] }[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1];
        const parent = computeInternalNode(left.hash, right.hash);
        for (const k of left.keys) proofMap.get(k)!.push(right.hash);
        for (const k of right.keys) proofMap.get(k)!.push(left.hash);
        nextLevel.push({ hash: parent, keys: [...left.keys, ...right.keys] });
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    currentLevel = nextLevel;
  }

  return { root: currentLevel[0].hash, proofs: proofMap };
}

describe("reward-vault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program(IDL, provider) as any;
  const admin = provider.wallet as anchor.Wallet;
  const tokenMint = Keypair.generate();

  let vaultStatePDA: PublicKey;
  let vaultStateBump: number;
  let treasuryPDA: PublicKey;
  let treasuryBump: number;

  before(async () => {
    [vaultStatePDA, vaultStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), tokenMint.publicKey.toBuffer()],
      program.programId,
    );
    [treasuryPDA, treasuryBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), tokenMint.publicKey.toBuffer()],
      program.programId,
    );
  });

  // ============================
  // INITIALIZE VAULT
  // ============================

  describe("initialize_vault", () => {
    it("creates vault with correct state", async () => {
      await program.methods
        .initializeVault()
        .accountsPartial({
          vaultState: vaultStatePDA,
          treasury: treasuryPDA,
          tokenMint: tokenMint.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const vault = await program.account.vaultState.fetch(vaultStatePDA);
      expect(vault.admin.toBase58()).to.equal(admin.publicKey.toBase58());
      expect(vault.tokenMint.toBase58()).to.equal(tokenMint.publicKey.toBase58());
      expect(vault.currentEpoch.toNumber()).to.equal(0);
      expect(vault.totalDistributed.toNumber()).to.equal(0);
      expect(vault.epochEndsAt.toNumber()).to.equal(0);
      expect(vault.merkleRoot).to.deep.equal(Array(32).fill(0));
    });

    it("rejects reinitialization", async () => {
      try {
        await program.methods
          .initializeVault()
          .accountsPartial({
            vaultState: vaultStatePDA,
            treasury: treasuryPDA,
            tokenMint: tokenMint.publicKey,
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have failed");
      } catch (err: any) {
        // Anchor rejects re-init because account already exists
        expect(err.toString()).to.include("already in use");
      }
    });
  });

  // ============================
  // UPDATE DISTRIBUTION
  // ============================

  describe("update_distribution", () => {
    const claimant1 = Keypair.generate();
    const claimant2 = Keypair.generate();
    let merkleRoot: Buffer;
    let proofs: Map<string, Buffer[]>;

    before(async () => {
      // Fund treasury with 1 SOL
      const sig = await provider.connection.requestAirdrop(treasuryPDA, LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);

      // Build merkle tree
      const tree = buildMerkleTree([
        { wallet: claimant1.publicKey, amount: 500_000_000n }, // 0.5 SOL
        { wallet: claimant2.publicKey, amount: 300_000_000n }, // 0.3 SOL
      ]);
      merkleRoot = tree.root;
      proofs = tree.proofs;
    });

    it("admin can update distribution", async () => {
      const rootArray = Array.from(merkleRoot);

      await program.methods
        .updateDistribution(rootArray, new anchor.BN(800_000_000))
        .accountsPartial({
          vaultState: vaultStatePDA,
          admin: admin.publicKey,
        })
        .rpc();

      const vault = await program.account.vaultState.fetch(vaultStatePDA);
      expect(vault.currentEpoch.toNumber()).to.equal(1);
      expect(vault.totalDistributed.toNumber()).to.equal(800_000_000);
      expect(vault.merkleRoot).to.deep.equal(rootArray);
      expect(vault.epochEndsAt.toNumber()).to.be.greaterThan(0);
    });

    it("rejects non-admin caller", async () => {
      const attacker = Keypair.generate();
      const airdropSig = await provider.connection.requestAirdrop(attacker.publicKey, LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(airdropSig);

      try {
        await program.methods
          .updateDistribution(Array.from(Buffer.alloc(32)), new anchor.BN(0))
          .accountsPartial({
            vaultState: vaultStatePDA,
            admin: attacker.publicKey,
          })
          .signers([attacker])
          .rpc();
        expect.fail("Should have failed — non-admin");
      } catch (err: any) {
        expect(err.toString()).to.include("Unauthorized");
      }
    });

    it("rejects update before epoch expires", async () => {
      try {
        await program.methods
          .updateDistribution(Array.from(Buffer.alloc(32)), new anchor.BN(0))
          .accountsPartial({
            vaultState: vaultStatePDA,
            admin: admin.publicKey,
          })
          .rpc();
        expect.fail("Should have failed — epoch not expired");
      } catch (err: any) {
        expect(err.toString()).to.include("EpochNotExpired");
      }
    });
  });

  // ============================
  // CLAIM
  // ============================

  describe("claim", () => {
    const claimant1 = Keypair.generate();
    const claimant2 = Keypair.generate();
    const claimant3 = Keypair.generate(); // not in tree
    let merkleRoot: Buffer;
    let proofs: Map<string, Buffer[]>;

    // Use a fresh vault for claim tests
    const claimMint = Keypair.generate();
    let claimVaultPDA: PublicKey;
    let claimTreasuryPDA: PublicKey;

    before(async () => {
      [claimVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_state"), claimMint.publicKey.toBuffer()],
        program.programId,
      );
      [claimTreasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury"), claimMint.publicKey.toBuffer()],
        program.programId,
      );

      // Init vault
      await program.methods
        .initializeVault()
        .accountsPartial({
          vaultState: claimVaultPDA,
          treasury: claimTreasuryPDA,
          tokenMint: claimMint.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Fund treasury
      const sig = await provider.connection.requestAirdrop(claimTreasuryPDA, 2 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);

      // Fund claimants
      for (const kp of [claimant1, claimant2, claimant3]) {
        const s = await provider.connection.requestAirdrop(kp.publicKey, 0.1 * LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(s);
      }

      // Build tree
      const tree = buildMerkleTree([
        { wallet: claimant1.publicKey, amount: 500_000_000n },
        { wallet: claimant2.publicKey, amount: 300_000_000n },
      ]);
      merkleRoot = tree.root;
      proofs = tree.proofs;

      // Update distribution
      await program.methods
        .updateDistribution(Array.from(merkleRoot), new anchor.BN(800_000_000))
        .accountsPartial({
          vaultState: claimVaultPDA,
          admin: admin.publicKey,
        })
        .rpc();
    });

    it("claimant can claim with valid proof", async () => {
      const amount = 500_000_000n;
      const proof = proofs.get(claimant1.publicKey.toBase58())!;
      const proofArrays = proof.map(p => Array.from(p));

      const vault = await program.account.vaultState.fetch(claimVaultPDA);
      const epochBytes = Buffer.alloc(8);
      epochBytes.writeBigUInt64LE(BigInt(vault.currentEpoch.toNumber()));

      const [claimStatusPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim"), claimVaultPDA.toBuffer(), epochBytes, claimant1.publicKey.toBuffer()],
        program.programId,
      );

      const balanceBefore = await provider.connection.getBalance(claimant1.publicKey);

      await program.methods
        .claim(new anchor.BN(Number(amount)), proofArrays)
        .accountsPartial({
          vaultState: claimVaultPDA,
          treasury: claimTreasuryPDA,
          claimStatus: claimStatusPDA,
          claimant: claimant1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([claimant1])
        .rpc();

      const balanceAfter = await provider.connection.getBalance(claimant1.publicKey);
      // Balance should increase by ~0.5 SOL minus tx fee and claim status rent
      expect(balanceAfter).to.be.greaterThan(balanceBefore + 400_000_000);

      // Verify claim status
      const claimStatus = await program.account.claimStatus.fetch(claimStatusPDA);
      expect(claimStatus.claimed).to.be.true;
      expect(claimStatus.amount.toNumber()).to.equal(Number(amount));
      expect(claimStatus.claimant.toBase58()).to.equal(claimant1.publicKey.toBase58());
    });

    it("rejects double claim (same epoch)", async () => {
      const amount = 500_000_000n;
      const proof = proofs.get(claimant1.publicKey.toBase58())!;
      const proofArrays = proof.map(p => Array.from(p));

      const vault = await program.account.vaultState.fetch(claimVaultPDA);
      const epochBytes = Buffer.alloc(8);
      epochBytes.writeBigUInt64LE(BigInt(vault.currentEpoch.toNumber()));

      const [claimStatusPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim"), claimVaultPDA.toBuffer(), epochBytes, claimant1.publicKey.toBuffer()],
        program.programId,
      );

      try {
        await program.methods
          .claim(new anchor.BN(Number(amount)), proofArrays)
          .accountsPartial({
            vaultState: claimVaultPDA,
            treasury: claimTreasuryPDA,
            claimStatus: claimStatusPDA,
            claimant: claimant1.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([claimant1])
          .rpc();
        expect.fail("Should have failed — double claim");
      } catch (err: any) {
        // ClaimStatus PDA already exists — init fails
        expect(err.toString()).to.include("already in use");
      }
    });

    it("rejects invalid proof (wrong wallet)", async () => {
      // claimant3 is not in the tree
      const fakeProof = proofs.get(claimant2.publicKey.toBase58())!;
      const proofArrays = fakeProof.map(p => Array.from(p));

      const vault = await program.account.vaultState.fetch(claimVaultPDA);
      const epochBytes = Buffer.alloc(8);
      epochBytes.writeBigUInt64LE(BigInt(vault.currentEpoch.toNumber()));

      const [claimStatusPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim"), claimVaultPDA.toBuffer(), epochBytes, claimant3.publicKey.toBuffer()],
        program.programId,
      );

      try {
        await program.methods
          .claim(new anchor.BN(300_000_000), proofArrays)
          .accountsPartial({
            vaultState: claimVaultPDA,
            treasury: claimTreasuryPDA,
            claimStatus: claimStatusPDA,
            claimant: claimant3.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([claimant3])
          .rpc();
        expect.fail("Should have failed — invalid proof");
      } catch (err: any) {
        expect(err.toString()).to.include("InvalidProof");
      }
    });

    it("rejects wrong amount with valid proof wallet", async () => {
      const proof = proofs.get(claimant2.publicKey.toBase58())!;
      const proofArrays = proof.map(p => Array.from(p));

      const vault = await program.account.vaultState.fetch(claimVaultPDA);
      const epochBytes = Buffer.alloc(8);
      epochBytes.writeBigUInt64LE(BigInt(vault.currentEpoch.toNumber()));

      const [claimStatusPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim"), claimVaultPDA.toBuffer(), epochBytes, claimant2.publicKey.toBuffer()],
        program.programId,
      );

      try {
        // Try claiming 999 SOL instead of 0.3 SOL
        await program.methods
          .claim(new anchor.BN(999_000_000_000), proofArrays)
          .accountsPartial({
            vaultState: claimVaultPDA,
            treasury: claimTreasuryPDA,
            claimStatus: claimStatusPDA,
            claimant: claimant2.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([claimant2])
          .rpc();
        expect.fail("Should have failed — wrong amount");
      } catch (err: any) {
        expect(err.toString()).to.include("InvalidProof");
      }
    });

    it("rejects zero-amount claim", async () => {
      const vault = await program.account.vaultState.fetch(claimVaultPDA);
      const epochBytes = Buffer.alloc(8);
      epochBytes.writeBigUInt64LE(BigInt(vault.currentEpoch.toNumber()));

      const [claimStatusPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim"), claimVaultPDA.toBuffer(), epochBytes, claimant3.publicKey.toBuffer()],
        program.programId,
      );

      try {
        await program.methods
          .claim(new anchor.BN(0), [])
          .accountsPartial({
            vaultState: claimVaultPDA,
            treasury: claimTreasuryPDA,
            claimStatus: claimStatusPDA,
            claimant: claimant3.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([claimant3])
          .rpc();
        expect.fail("Should have failed — zero amount");
      } catch (err: any) {
        expect(err.toString()).to.include("ZeroAmount");
      }
    });

    it("second claimant can also claim with valid proof", async () => {
      const amount = 300_000_000n;
      const proof = proofs.get(claimant2.publicKey.toBase58())!;
      const proofArrays = proof.map(p => Array.from(p));

      const vault = await program.account.vaultState.fetch(claimVaultPDA);
      const epochBytes = Buffer.alloc(8);
      epochBytes.writeBigUInt64LE(BigInt(vault.currentEpoch.toNumber()));

      const [claimStatusPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim"), claimVaultPDA.toBuffer(), epochBytes, claimant2.publicKey.toBuffer()],
        program.programId,
      );

      await program.methods
        .claim(new anchor.BN(Number(amount)), proofArrays)
        .accountsPartial({
          vaultState: claimVaultPDA,
          treasury: claimTreasuryPDA,
          claimStatus: claimStatusPDA,
          claimant: claimant2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([claimant2])
        .rpc();

      const claimStatus = await program.account.claimStatus.fetch(claimStatusPDA);
      expect(claimStatus.claimed).to.be.true;
      expect(claimStatus.amount.toNumber()).to.equal(Number(amount));
    });
  });

  // ============================
  // TREASURY RENT EXEMPTION
  // ============================

  describe("treasury rent protection", () => {
    const rentMint = Keypair.generate();
    let rentVaultPDA: PublicKey;
    let rentTreasuryPDA: PublicKey;

    before(async () => {
      [rentVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_state"), rentMint.publicKey.toBuffer()],
        program.programId,
      );
      [rentTreasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury"), rentMint.publicKey.toBuffer()],
        program.programId,
      );

      await program.methods
        .initializeVault()
        .accountsPartial({
          vaultState: rentVaultPDA,
          treasury: rentTreasuryPDA,
          tokenMint: rentMint.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Fund treasury with just enough above rent (tiny amount)
      const sig = await provider.connection.requestAirdrop(rentTreasuryPDA, 0.002 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);
    });

    it("rejects claim exceeding treasury balance", async () => {
      const claimant = Keypair.generate();
      const fundSig = await provider.connection.requestAirdrop(claimant.publicKey, 0.1 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(fundSig);

      // Build tree where claimant gets more than treasury has
      const treasuryBalance = await provider.connection.getBalance(rentTreasuryPDA);
      const claimAmount = BigInt(treasuryBalance + 1_000_000_000); // more than available
      const tree = buildMerkleTree([
        { wallet: claimant.publicKey, amount: claimAmount },
      ]);

      await program.methods
        .updateDistribution(Array.from(tree.root), new anchor.BN(Number(claimAmount)))
        .accountsPartial({
          vaultState: rentVaultPDA,
          admin: admin.publicKey,
        })
        .rpc();

      const vault = await program.account.vaultState.fetch(rentVaultPDA);
      const epochBytes = Buffer.alloc(8);
      epochBytes.writeBigUInt64LE(BigInt(vault.currentEpoch.toNumber()));

      const [claimStatusPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim"), rentVaultPDA.toBuffer(), epochBytes, claimant.publicKey.toBuffer()],
        program.programId,
      );

      const proof = tree.proofs.get(claimant.publicKey.toBase58())!;

      try {
        await program.methods
          .claim(new anchor.BN(Number(claimAmount)), proof.map(p => Array.from(p)))
          .accountsPartial({
            vaultState: rentVaultPDA,
            treasury: rentTreasuryPDA,
            claimStatus: claimStatusPDA,
            claimant: claimant.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([claimant])
          .rpc();
        expect.fail("Should have failed — would break rent exemption");
      } catch (err: any) {
        expect(err.toString()).to.include("InsufficientFunds");
      }
    });
  });
});
