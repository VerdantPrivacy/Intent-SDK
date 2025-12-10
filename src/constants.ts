import { PublicKey } from '@solana/web3.js';

export const DERIVATION_PATH_ROOT = "m/44'/501'"; // Standard Solana BIP44
export const VERDANT_PROGRAM_ID = new PublicKey("Vrdnt...[PLACEHOLDER]"); // Replace with actual ID
export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
export const LAMPORTS_PER_SOL = 1_000_000_000;
export const SHARD_DEPTH = 10; // Max shards per persona for beta