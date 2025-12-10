import { Persona } from './Persona';
import { encryptLocalData, decryptLocalData } from '../utils/crypto';
import { PersonaConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class IdentityManager {
  private encryptionKey: Uint8Array; // Derived from user password/signature
  private personas: Map<string, Persona>;
  
  constructor(encryptionKey: Uint8Array) {
    this.encryptionKey = encryptionKey;
    this.personas = new Map();
  }

  public createPersona(label: string, mnemonic: string, index: number, shardCount: number = 5): PersonaConfig {
    const encryptedSeed = encryptLocalData(mnemonic, this.encryptionKey);
    
    const config: PersonaConfig = {
      id: uuidv4(),
      label,
      seed: encryptedSeed,
      derivationIndex: index,
      shards: shardCount
    };

    const persona = new Persona(config, mnemonic);
    this.personas.set(config.id, persona);
    
    return config;
  }

  public loadPersona(config: PersonaConfig): Persona {
    const mnemonic = decryptLocalData(config.seed, this.encryptionKey);
    const persona = new Persona(config, mnemonic);
    this.personas.set(config.id, persona);
    return persona;
  }

  public getPersona(id: string): Persona | undefined {
    return this.personas.get(id);
  }
}