import * as PIXI from 'pixi.js-legacy';
import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';

export function renderCellBehaviour(
  behaviour: ICellBehaviour,
  isEmpty: boolean,
  graphics: PIXI.Graphics,
  cellSize: number
) {
  const color = behaviour.color;
  const opacity = 1;

  if (isEmpty) {
    switch (behaviour.type) {
      case CellType.Infection:
        graphics.beginFill(color);
        graphics.drawRect(0, 0, cellSize, cellSize);
        break;
      case CellType.FinishChallenge:
        graphics.beginFill(color);
        graphics.drawRect(0, 0, cellSize, cellSize);
        break;
      case CellType.Wafer:
        graphics.beginFill(color, Math.min(opacity, 1));

        graphics.drawRect(
          0,
          (cellSize * 1.5) / 8,
          cellSize,
          (cellSize * 0.5) / 8
        );

        graphics.drawRect(
          0,
          (cellSize * 4) / 8,
          cellSize,
          (cellSize * 0.5) / 8
        );

        graphics.drawRect(
          0,
          (cellSize * 6) / 8,
          cellSize,
          (cellSize * 0.5) / 8
        );

        break;
      case CellType.Key:
        graphics.beginFill(color, Math.min(opacity, 1));

        // bit
        graphics.drawRect(
          (cellSize * 4.5) / 8,
          (cellSize * 1.5) / 8,
          (cellSize * 1) / 8,
          (cellSize * 0.5) / 8
        );

        graphics.drawRect(
          (cellSize * 4.5) / 8,
          (cellSize * 2.5) / 8,
          (cellSize * 1) / 8,
          (cellSize * 0.5) / 8
        );

        // shank
        graphics.drawRect(
          (cellSize * 3.5) / 8,
          (cellSize * 1) / 8,
          (cellSize * 1) / 8,
          (cellSize * 4) / 8
        );

        // bow
        graphics.drawRect(
          (cellSize * 2.5) / 8,
          (cellSize * 5) / 8,
          (cellSize * 3) / 8,
          (cellSize * 2) / 8
        );
        break;
      case CellType.Lock:
        // background
        graphics.beginFill(color, Math.min(opacity, 0.5));
        graphics.drawRect(0, 0, cellSize, cellSize);

        graphics.beginFill(color, Math.min(opacity, 1));
        // shackle - top
        graphics.drawRect(
          (cellSize * 2) / 8,
          cellSize / 8,
          (cellSize * 4) / 8,
          cellSize / 8
        );

        // shackle - sides
        graphics.drawRect(
          (cellSize * 2) / 8,
          cellSize / 8,
          (cellSize * 1) / 8,
          (cellSize * 3) / 8
        );

        graphics.drawRect(
          (cellSize * 5) / 8,
          cellSize / 8,
          (cellSize * 1) / 8,
          (cellSize * 3) / 8
        );

        // body
        graphics.drawRect(
          (cellSize * 1) / 8,
          cellSize * (4 / 8),
          (cellSize * 6) / 8,
          (cellSize * 3) / 8
        );
        break;
    }
  } else {
    graphics.beginFill(color);
    graphics.drawRect(0, 0, cellSize, cellSize);
    switch (behaviour.type) {
    }
  }
}
