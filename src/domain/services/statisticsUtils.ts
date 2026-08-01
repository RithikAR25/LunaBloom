export function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export function medianAbsoluteDeviation(arr: number[], medianVal: number): number {
  if (arr.length === 0) return 0;
  const deviations = arr.map(x => Math.abs(x - medianVal));
  return median(deviations);
}

export function standardDeviation(arr: number[], meanVal: number): number {
  if (arr.length === 0) return 0;
  const variance = arr.reduce((acc, x) => acc + Math.pow(x - meanVal, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * Calculates a continuous decay weight for a cycle based on its distance from the median,
 * scaled by the Median Absolute Deviation (MAD).
 * Returns a weight between 0.0 and 1.0.
 */
export function continuousDecayWeight(distance: number, mad: number): number {
  // Prevent division by zero if MAD is 0 (all cycles are identical)
  if (mad === 0) {
    return distance === 0 ? 1.0 : 0.0;
  }
  
  // Using a Cauchy/Lorentzian distribution inspired weight:
  // weight = 1 / (1 + (distance / (mad * 2.5))^2)
  // This smoothly downweights outliers without a hard cutoff.
  const scaledDistance = distance / (mad * 2.5);
  return 1 / (1 + Math.pow(scaledDistance, 2));
}
