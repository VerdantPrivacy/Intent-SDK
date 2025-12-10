import { Connection, Keypair, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { IdentityManager } from './identity/IdentityManager';
import { IntentBuilder } from './engine/IntentBuilder';
import { FogGenerator } from './engine/FogGenerator';
import { Intent, PrivacyLevel } from './types';
import { Persona } from './identity/Persona';

export interface VerdantConfig {
  connectionUrl: string;
  masterSecret: Uint8Array; // Derived from wallet signature on init
}

export class VerdantClient {
  public connection: Connection;
  public identity: IdentityManager;
  public fog: FogGenerator;

  constructor(config: VerdantConfig) {
    this.connection = new Connection(config.connectionUrl, 'confirmed');
    this.identity = new IdentityManager(config.masterSecret);
    this.fog = new FogGenerator(this.connection);
  }

  /**
   * Factory method to start building a transaction
   */
  public createIntent(): IntentBuilder {
    return new IntentBuilder();
  }

  /**
   * Executes an Intent by signing and broadcasting the split transactions.
   * NOTE: In a real protocol, this might send the Intent to a Shadow Node.
   * For this SDK (Client-Side Mode), we execute directly.
   */
  public async executeIntent(intent: Intent, persona: Persona): Promise<string[]> {
    const signatures: string[] = [];

    console.log(`[Verdant] Executing Intent ${intent.id} via ${intent.plan.fragments.length} shards.`);

    for (const fragment of intent.plan.fragments) {
      const shard = persona.getShard(fragment.shardIndex);
      if (!shard || !shard.keypair) continue;

      // Privacy Delay
      if (fragment.delaySeconds > 0) {
        console.log(`[Verdant] Applying noise delay: ${fragment.delaySeconds}s...`);
        await new Promise(r => setTimeout(r, fragment.delaySeconds * 1000));
      }

      // Construct Transaction
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: shard.address,
          toPubkey: new PublicKey(intent.recipient),
          lamports: fragment.amount
        })
      );

      try {
        const sig = await this.connection.sendTransaction(tx, [shard.keypair]);
        signatures.push(sig);
        console.log(`[Verdant] Fragment sent: ${sig}`);
      } catch (e) {
        console.error(`[Verdant] Fragment failed`, e);
      }
    }

    return signatures;
  }
}