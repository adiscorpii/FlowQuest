import { mulberry32, randBool, randInt } from "./random.js";

function createSeed() {
  // Prefer crypto if available; fall back to time-based seed.
  try {
    const buf = new Uint32Array(1);
    globalThis.crypto?.getRandomValues?.(buf);
    if (buf[0] !== 0) return buf[0] >>> 0;
  } catch {
    // ignore
  }
  return (Date.now() >>> 0) ^ ((Math.random() * 0xffffffff) >>> 0);
}

export function createInitialRunState(seed = createSeed()) {
  const rand = mulberry32(seed);

  // "Randomize the filtration process" by varying the starting impurities each run,
  // while keeping the science explainable and consistent within that run.
  const startsWithStones = randBool(rand, 0.6);

  return {
    meta: {
      seed,
      variant: {
        level1: {
          startsWithStones,
        },
        level2: {
          // just for stable shuffles; values are deterministic from `seed`
          shuffleKey: randInt(rand, 1, 1_000_000_000),
        },
      },
    },
    coins: 0,
    scores: {
      cleanliness: 0, // 0-100
      safety: 50,     // 0-100-ish
      efficiency: 50, // 0-100-ish
    },
    water: {
      // visual state flags
      stones: startsWithStones,
      mud: true,
      color: "dirty", // dirty | cloudy | clear
      germs: false,
      clogged: false,
    },
    progress: {
      level1Done: false,
      level2Done: false,
      level3Done: false,
    },
    city: {
      budget: 100,
      infra: 70,
      demand: 60,
      round: 1,
      log: [],
    },
  };
}

// Back-compat export (some files may still import this).
export const initialRunState = createInitialRunState(1);