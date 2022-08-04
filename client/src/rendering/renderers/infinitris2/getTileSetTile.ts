import { CellConnection } from '@src/rendering/renderers/infinitris2/Infinitris2Renderer';

export function getTileSetTile(connections: CellConnection[]): {
  row: number;
  column: number;
} {
  // most of this code comes from the original Infinitris, 4 years ago. kill me now :D
  let t = connections.some((c) => c.dx === 0 && c.dy === -1);
  let b = connections.some((c) => c.dx === 0 && c.dy === 1);
  let l = connections.some((c) => c.dx === -1 && c.dy === 0);
  let r = connections.some((c) => c.dx === 1 && c.dy === 0);

  let tl = connections.some((c) => c.dx === -1 && c.dy === -1);
  let tr = connections.some((c) => c.dx === 1 && c.dy === -1);
  let bl = connections.some((c) => c.dx === -1 && c.dy === 1);
  let br = connections.some((c) => c.dx === 1 && c.dy === 1);

  if (t && tl && l && bl && b && br && r && tr) return { row: 1, column: 1 };
  else if (t && l && bl && b && br && r && tr) return { row: 6, column: 3 };
  else if (t && tl && l && bl && b && r && br) return { row: 6, column: 2 };
  else if (t && tl && l && bl && b && r && tr) return { row: 6, column: 0 };
  else if (t && tl && l && b && br && r && tr) return { row: 6, column: 1 };
  else if (t && tl && l && b && br && r) return { row: 6, column: 5 };
  else if (t && l && bl && b && r && tr) return { row: 6, column: 4 };
  else if (t && tl && l && bl && b && r) return { row: 4, column: 4 };
  else if (t && l && br && b && r && tr) return { row: 4, column: 5 };
  else if (t && l && bl && b && br && r) return { row: 5, column: 1 };
  else if (t && tl && l && b && r && tr) return { row: 4, column: 1 };
  else if (t && b && br && r && tr) return { row: 1, column: 0 };
  else if (t && tl && l && bl && b) return { row: 1, column: 2 };
  else if (l && bl && b && br && r) return { row: 0, column: 1 };
  else if (t && tl && l && r && tr) return { row: 2, column: 1 };
  else if (l && b && br && r && tr) return { row: 3, column: 5 };
  else if (r && b && l && bl && tl) return { row: 3, column: 4 };
  else if (t && b && l && r && bl) return { row: 1, column: 6 };
  else if (t && b && l && r && br) return { row: 4, column: 6 };
  else if (t && b && l && r && tl) return { row: 2, column: 6 };
  else if (t && b && l && r && tr) return { row: 3, column: 6 };
  else if (t && tl && l && bl && r) return { row: 5, column: 4 };
  else if (t && tr && r && br && l) return { row: 5, column: 5 };
  else if (b && bl && l && tl && r) return { row: 3, column: 4 };
  else if (b && br && r && tr && l) return { row: 3, column: 5 };
  else if (t && tl && l && bl) return { row: 2, column: 2 };
  else if (t && tr && r && br) return { row: 2, column: 0 };
  else if (b && bl && l && tl) return { row: 0, column: 2 };
  else if (b && br && r && tr) return { row: 0, column: 0 };
  else if (t && l && bl && b) return { row: 5, column: 2 };
  else if (t && r && br && b) return { row: 5, column: 0 };
  else if (b && l && tl && t) return { row: 4, column: 2 };
  else if (b && r && tr && t) return { row: 4, column: 0 };
  else if (l && t && tr && r) return { row: 5, column: 5 };
  else if (r && t && tl && l) return { row: 5, column: 4 };
  else if (l && b && br && r) return { row: 3, column: 5 };
  else if (r && b && bl && l) return { row: 3, column: 4 };
  else if (t && b && l && r) return { row: 1, column: 4 };
  else if (r && b && br) return { row: 0, column: 0 };
  else if (l && b && bl) return { row: 0, column: 2 };
  else if (r && t && tr) return { row: 2, column: 0 };
  else if (t && tl && l) return { row: 2, column: 2 };
  else if (t && l && r) return { row: 2, column: 4 };
  else if (b && l && r) return { row: 0, column: 4 };
  else if (t && b && r) return { row: 1, column: 3 };
  else if (t && b && l) return { row: 1, column: 5 };
  else if (t && b) return { row: 4, column: 3 };
  else if (l && r) return { row: 3, column: 1 };
  else if (l && t) return { row: 2, column: 5 };
  else if (r && t) return { row: 2, column: 3 };
  else if (l && b) return { row: 0, column: 5 };
  else if (r && b) return { row: 0, column: 3 };
  else if (t) return { row: 5, column: 3 };
  else if (b) return { row: 3, column: 3 };
  else if (l) return { row: 3, column: 2 };
  else if (r) return { row: 3, column: 0 };
  else return { row: 0, column: 6 };
}
