use anchor_lang::solana_program::hash::hashv;

/// Maximum proof depth — supports up to ~1M leaves
pub const MAX_PROOF_DEPTH: usize = 20;

/// Verify a merkle proof against a root.
///
/// Uses SHA-256 with domain separation:
/// - Leaf prefix: [0u8]
/// - Internal node prefix: [1u8]
/// - Sorted pair ordering (smaller hash left) prevents second-preimage attacks
///
/// Pattern from Jito's battle-tested merkle-distributor.
pub fn verify(proof: &[[u8; 32]], root: &[u8; 32], leaf: [u8; 32]) -> bool {
    let mut computed = leaf;
    for node in proof.iter() {
        let (left, right) = if computed <= *node {
            (computed, *node)
        } else {
            (*node, computed)
        };
        computed = hashv(&[&[1u8], &left, &right]).to_bytes();
    }
    computed == *root
}

/// Construct a leaf hash from wallet pubkey bytes and amount.
/// leaf = hash([0x00, hash([wallet_32bytes, amount_u64_le])])
pub fn compute_leaf(wallet: &[u8; 32], amount: u64) -> [u8; 32] {
    let inner = hashv(&[wallet, &amount.to_le_bytes()]).to_bytes();
    hashv(&[&[0u8], &inner]).to_bytes()
}
