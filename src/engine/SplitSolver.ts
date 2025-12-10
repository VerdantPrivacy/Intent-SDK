import { Shard, SplitPlan, PrivacyLevel } from '../types';
import { gaussianRandom, clamp } from '../utils/math';

export class SplitSolver {
  
  /**
   * Calculates how to fragment a total amount across available shards.
   * It uses a probabilistic approach to avoid round numbers.
   */
  public static solve(
    totalAmount: number, 
    availableShards: Shard[], 
    privacyLevel: PrivacyLevel
  ): SplitPlan {
    
    let remaining = totalAmount;
    const plan: SplitPlan = {
      totalAmount,
      fragments: []
    };

    // Filter shards with balance > 0
    const capableShards = availableShards.filter(s => s.balance > 0);
    if (capableShards.length === 0) throw new Error("No capable shards found.");

    // Determine fragmentation factor based on privacy level
    let parts = privacyLevel === PrivacyLevel.GHOST ? 5 : 3;
    parts = Math.min(parts, capableShards.length);

    for (let i = 0; i < parts - 1; i++) {
      // Use Gaussian math to find a "natural" split chunk
      // Mean is remaining / remaining_parts, Deviation is 20%
      const mean = remaining / (parts - i);
      const dev = mean * 0.2;
      
      let chunk = Math.floor(gaussianRandom(mean, dev));
      
      // Safety clamps
      chunk = clamp(chunk, 1000, remaining - 1000); 
      
      // Select a random shard (simple round robin or random pick)
      const shard = capableShards[i % capableShards.length]; // Simplified selection

      plan.fragments.push({
        shardIndex: shard.index,
        amount: chunk,
        delaySeconds: this.calculateDelay(privacyLevel)
      });

      remaining -= chunk;
    }

    // Add the final remainder
    const lastShard = capableShards[(parts - 1) % capableShards.length];
    plan.fragments.push({
      shardIndex: lastShard.index,
      amount: remaining,
      delaySeconds: this.calculateDelay(privacyLevel)
    });

    return plan;
  }

  private static calculateDelay(level: PrivacyLevel): number {
    if (level === PrivacyLevel.STANDARD) return 0;
    if (level === PrivacyLevel.HIGH) return Math.floor(Math.random() * 60); // 0-60s
    if (level === PrivacyLevel.GHOST) return Math.floor(Math.random() * 300); // 0-5m
    return 0;
  }
}