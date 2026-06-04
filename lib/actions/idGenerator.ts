/**
 * A deterministic hash function (cyrb53) for stable Action IDs.
 * Ensures the same input string always produces the same hash integer.
 */
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Generates a stable Action ID from a sorted list of source event IDs and a type prefix.
 * 
 * @param sourceIds Array of raw event IDs this action was derived from.
 * @param type Prefix string denoting the action type (e.g., 'reddit', 'content').
 * @returns A stable, deterministic string ID.
 */
export function generateStableId(sourceIds: string[], type: string): string {
  const sorted = [...sourceIds].sort();
  const hash = cyrb53(`${type}:${sorted.join(",")}`);
  return `act_${hash.toString(16)}`;
}
