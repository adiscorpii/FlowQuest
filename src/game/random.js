// Small deterministic RNG helpers (seeded) to keep "random" gameplay stable per run.

// Mulberry32 PRNG: fast, simple, good enough for gameplay shuffles.
// Returns a function that yields floats in [0, 1).
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithRng(list, rand) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function shuffleWithSeed(list, seed) {
  return shuffleWithRng(list, mulberry32(seed));
}

export function randInt(rand, minInclusive, maxInclusive) {
  const span = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(rand() * span);
}

export function randBool(rand, pTrue = 0.5) {
  return rand() < pTrue;
}

