import * as PIXI from 'pixi.js-legacy';
import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import { imagesDirectory } from '@src/rendering/renderers';
import { WorldVariation } from '@models/WorldType';

export function renderCellBehaviour(
  // behaviour: ICellBehaviour,
  // isEmpty: boolean,
  // graphics: PIXI.Graphics,
  // cellSize: number,
  // challengeEditorEnabled = false,
  // worldVariation: WorldVariation = '0'
  filename: string | undefined
): PIXI.Sprite | undefined {
  const sprite = !filename ? undefined : PIXI.Sprite.from(filename);

  return sprite;
}

export function getCellBehaviourImageFilename(
  behaviour: ICellBehaviour,
  isEmpty: boolean,
  worldVariation: WorldVariation = '0',
  challengeEditorEnabled = false
) {
  // TODO: check challengeEditorEnabled in the behaviour rather than doing it here
  if (
    !challengeEditorEnabled &&
    (behaviour.type === CellType.SpawnLocation ||
      behaviour.type === CellType.Gesture)
  ) {
    return undefined;
  }
  // TODO: use a sprite sheet instead of individual sprites
  let filename: string | undefined;
  try {
    filename = `${imagesDirectory}/cells/${
      behaviour.hasWorldImage?.() ? 'grass/' : ''
    }${behaviour.getImageFilename?.()}${
      worldVariation !== '0' && behaviour.hasWorldVariationImage?.()
        ? '_variation' + worldVariation
        : ''
    }.png`;
  } catch (error) {}

  return filename;
}
