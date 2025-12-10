import { Intent, PrivacyLevel, SplitPlan } from '../types';
import { SplitSolver } from './SplitSolver';
import { Persona } from '../identity/Persona';
import { v4 as uuidv4 } from 'uuid';

export class IntentBuilder {
  private recipient: string = '';
  private amount: number = 0;
  private privacyLevel: PrivacyLevel = PrivacyLevel.STANDARD;
  private persona: Persona | null = null;

  public setRecipient(address: string): this {
    this.recipient = address;
    return this;
  }

  public setAmount(lamports: number): this {
    this.amount = lamports;
    return this;
  }

  public setPrivacyLevel(level: PrivacyLevel): this {
    this.privacyLevel = level;
    return this;
  }

  public usePersona(persona: Persona): this {
    this.persona = persona;
    return this;
  }

  public build(): Intent {
    if (!this.persona) throw new Error("Persona not set");
    if (this.amount <= 0) throw new Error("Invalid amount");

    const plan: SplitPlan = SplitSolver.solve(
      this.amount, 
      this.persona.getAllShards(), 
      this.privacyLevel
    );

    return {
      id: uuidv4(),
      recipient: this.recipient,
      amount: this.amount,
      privacyLevel: this.privacyLevel,
      signature: "PENDING_SIGNATURE", // To be signed by master key
      plan: plan
    };
  }
}