import Grid from '../src/grid/Grid';
import Player from '../src/player/Player';

class DummyPlayer extends Player {}

describe('Player', () => {
  it("will create a block if it doesn't have one", () => {
    const grid = new Grid();
    const player = new DummyPlayer(1);
    player.update(grid.cells, {});
    expect(player.block).toBeTruthy();
  });
});
