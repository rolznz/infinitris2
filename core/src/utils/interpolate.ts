export function interpolate(a: number, b: number, amount: number) {
  return a * (1 - amount) + b * amount;
}
