import Block from '../src/block/Block';
import Grid from '../src/grid/Grid';
import Player from '../src/player/Player';

class DummyPlayer extends Player {}

describe('Player', () => {
  it("will create a block if it doesn't have one", () => {
    const eventListener = {
      // tslint:disable-next-line: no-empty
      onBlockCreated: (block: IBlock) => {},
      // tslint:disable-next-line: no-empty
      onBlockPlaced: (block: IBlock) => {},
      // tslint:disable-next-line: no-empty
      onBlockMoved: (block: IBlock) => {},
      // tslint:disable-next-line: no-empty
      onBlockDied: (block: IBlock) => {},
    };
    const grid = new Grid();
    const player = new DummyPlayer(1, eventListener);
    player.update(grid.cells);
    expect(player.block).toBeTruthy();
  });
});
