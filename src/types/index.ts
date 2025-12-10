import { Keypair, PublicKey } from '@solana/web3.js';

export enum PrivacyLevel {
  STANDARD = 'STANDARD', // No delay, random split
  HIGH = 'HIGH',         // Short delay, complex split
  GHOST = 'GHOST'        // Long delay, multi-hop, fog
}

export interface Shard {
  index: number;
  address: PublicKey;
  keypair?: Keypair; // Only present if decrypted
  balance: number;   // in Lamports
}

export interface PersonaConfig {
  id: string;
  label: string;
  seed: string; // Encrypted mnemonic or seed hex
  derivationIndex: number;
  shards: number;
}

export interface SplitPlan {
  totalAmount: number;
  fragments: {
    shardIndex: number;
    amount: number;
    delaySeconds: number;
  }[];
}

export interface Intent {
  id: string;
  recipient: string;
  amount: number;
  privacyLevel: PrivacyLevel;
  signature: string;
  plan: SplitPlan;
}