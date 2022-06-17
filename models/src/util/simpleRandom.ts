// from https://stackoverflow.com/a/47593316/4562693

function mulberry32(a: number) {
  var t = (a += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function simpleRandom(seed: number) {
  return mulberry32(seed);
}
