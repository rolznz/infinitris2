export function wrap(x: number, width: number) {
  return ((x % width) + width) % width;
}

// thanks to https://blog.demofox.org/2017/10/01/calculating-the-distance-between-points-in-wrap-around-toroidal-space/
export function wrappedDistance(x1: number, x2: number, width: number) {
  let dx = Math.abs(x1 - x2);
  if (dx > width / 2) {
    dx = width - dx;
  }
  return dx;
}
