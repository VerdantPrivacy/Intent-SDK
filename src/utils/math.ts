/**
 * Generates a number following a Gaussian (Normal) distribution.
 * Used to mimic organic human behavior in transaction amounts.
 */
export const gaussianRandom = (mean: number, stdev: number): number => {
  const u = 1 - Math.random(); 
  const v = Math.random();
  const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  return z * stdev + mean;
};

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);