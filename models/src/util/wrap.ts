export function wrap(x: number, width: number) {
  return ((x % width) + width) % width;
}
