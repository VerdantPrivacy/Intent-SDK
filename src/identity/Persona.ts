import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import * as ed25519 from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import { Shard, PersonaConfig } from '../types';
import { DERIVATION_PATH_ROOT } from '../constants';

export class Persona {
  private config: PersonaConfig;
  private masterSeed: Buffer;
  public shards: Map<number, Shard>;

  constructor(config: PersonaConfig, decryptedMnemonic: string) {
    this.config = config;
    this.masterSeed = bip39.mnemonicToSeedSync(decryptedMnemonic);
    this.shards = new Map();
    this.initializeShards();
  }

  private initializeShards() {
    for (let i = 0; i < this.config.shards; i++) {
      // Path: m/44'/501'/PersonaIndex'/0'/ShardIndex'
      const path = `${DERIVATION_PATH_ROOT}/${this.config.derivationIndex}'/0'/${i}'`;
      const derived = ed25519.derivePath(path, this.masterSeed.toString('hex'));
      const keypair = Keypair.fromSeed(derived.key);

      this.shards.set(i, {
        index: i,
        address: keypair.publicKey,
        keypair: keypair,
        balance: 0
      });
    }
  }

  public getShard(index: number): Shard | undefined {
    return this.shards.get(index);
  }

  public getAllShards(): Shard[] {
    return Array.from(this.shards.values());
  }

  public async refreshBalances(connection: Connection) {
    const pubKeys = this.getAllShards().map(s => s.address);
    // In production, batch this call or use getMultipleAccountsInfo
    for (const shard of this.getAllShards()) {
      const balance = await connection.getBalance(shard.address);
      shard.balance = balance;
      this.shards.set(shard.index, shard);
    }
  }

  public getTotalBalance(): number {
    let total = 0;
    this.shards.forEach(s => total += s.balance);
    return total;
  }
}