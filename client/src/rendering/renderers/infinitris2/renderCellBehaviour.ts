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
  worldVariation: WorldVariation = '0',
  challengeEditorEnabled = false
) {
  if (!challengeEditorEnabled && behaviour.type === CellType.SpawnLocation) {
    return undefined;
  }
  // TODO: use a sprite sheet instead of individual sprites
  let filename: string | undefined;
  try {
    filename = `${imagesDirectory}/cells/grass/${
      behaviour.getImageFilename?.() || behaviour.toChallengeCellType()
    }${worldVariation !== '0' ? '_variation' + worldVariation : ''}.png`;
  } catch (error) {}

  return filename;
}
