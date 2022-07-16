import { simpleRandom } from '@models/util/simpleRandom';
import { simpleStringHash } from '@models/util/simpleStringHash';

/**
 * Given a key, get a random value
 * All key seeds are derived from the root seed
 */
export class KeyedRandom {
  private _seeds: { [key: string]: number };
  private _rootSeed: number;
  constructor(rootSeed: number) {
    this._rootSeed = rootSeed;
    this._seeds = {};
  }

  next(key: string): number {
    const seed = this._seeds[key] ?? this._rootSeed + simpleStringHash(key);
    const value = simpleRandom(seed);
    this._seeds[key] = seed + 1;
    return value;
  }
}
