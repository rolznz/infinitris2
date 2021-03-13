require('module-alias/register');
import 'jasmine';
import tetrominoes from '@models/exampleBlockLayouts/Tetrominoes';
import Block from '../src/block/Block';
import Grid from '@core/grid/Grid';
describe('Cell', () => {
  it('Cannot add the same block twice', () => {
    // add the block to an isolated grid
    const block = new Block(
      1,
      tetrominoes.T,
      0,
      0,
      0,
      new Grid().cells,
      undefined
    );

    const grid = new Grid();
    const cell = grid.cells[0][0];
    cell.addBlock(block);
    expect(() => cell.addBlock(block)).toThrowError(
      'Cannot add the same block to a cell'
    );
  });
  it('Cannot remove a block from a cell that does not contain it', () => {
    // add the block to an isolated grid
    const block = new Block(
      1,
      tetrominoes.T,
      0,
      0,
      0,
      new Grid().cells,
      undefined
    );

    const grid = new Grid();
    const cell = grid.cells[0][0];
    expect(() => cell.removeBlock(block)).toThrowError(
      'Block does not exist in cell'
    );
  });
});
