import Layout from '@models/Layout';

export default class LayoutUtils {
  /**
   * Rotates a block layout by the given rotation value.
   *
   * @param layout the layout to rotate.
   * @param rotation the number of 90 degree rotations to apply.
   */
  static rotate(layout: Layout, rotation: number) {
    if (layout.length !== layout[0].length) {
      throw new Error('Layout must have the same number of rows and columns');
    }
    rotation = ((rotation % 4) + 4) % 4;

    let prev = layout;
    for (let i = 0; i < rotation; i++) {
      const rotatedCells: number[][] = [];

      for (let row: number = 0; row < layout.length; ++row) {
        rotatedCells.push(new Array<number>(layout.length));

        for (let col: number = 0; col < layout.length; ++col) {
          rotatedCells[row][col] = prev[layout.length - col - 1][row];
        }
      }
      prev = rotatedCells;
    }

    return prev;
  }

  // returns true if there is a rotation that does not cause gaps
  // s and z layouts cannot be safely placed as the first block.
  static isSafeLayout(layout: Layout): boolean {
    const minimalLayout = layout.filter((row) => row.some((cell) => cell));
    return !minimalLayout[minimalLayout.length - 1].some(
      (cell, index) => !cell && minimalLayout[minimalLayout.length - 2][index]
    );
  }

  static getNumCells(layout: Layout): number {
    if (layout.length !== layout[0].length) {
      throw new Error('Layout must have the same number of rows and columns');
    }

    let num = 0;
    for (let row: number = 0; row < layout.length; row++) {
      for (let col: number = 0; col < layout.length; col++) {
        if (layout[row][col]) {
          ++num;
        }
      }
    }
    return num;
  }
}
