import * as PIXI from 'pixi.js-legacy';
import ICellBehaviour from '@models/ICellBehaviour';
import CellType from '@models/CellType';
import { imagesDirectory } from '@src/rendering/renderers';
import { WorldType, WorldVariation } from '@models/WorldType';
import { getTileSetTile } from '@src/rendering/renderers/infinitris2/getTileSetTile';
import { CellConnection } from '@src/rendering/renderers/infinitris2/Infinitris2Renderer';

const textureCache: { [key: string]: PIXI.Texture } = {};

const getTextureCacheKey = (filename: string, row: number, column: number) =>
  `${filename}_${row}_${column}`;

export function renderCellBehaviour(
  // isEmpty: boolean,
  // graphics: PIXI.Graphics,
  // cellSize: number,
  // challengeEditorEnabled = false,
  // worldVariation: WorldVariation = '0'
  filename: string | undefined,
  connections: CellConnection[],
  behaviour: ICellBehaviour
): PIXI.Sprite | undefined {
  if (!filename) {
    return undefined;
  }
  let sprite = PIXI.Sprite.from(filename);
  if (behaviour.hasTileset?.()) {
    const tileSize = 64; // FIXME: this is hardcoded because the texture is not loaded yet so we can't get the size

    const { row, column } = getTileSetTile(connections);
    const cacheKey = getTextureCacheKey(filename, row, column);
    let tileTexture = textureCache[cacheKey];
    if (!tileTexture) {
      tileTexture = new PIXI.Texture(
        sprite.texture.baseTexture,
        new PIXI.Rectangle(
          tileSize * column,
          tileSize * row,
          tileSize,
          tileSize
        )
      );
      textureCache[cacheKey] = tileTexture;
    }
    sprite = PIXI.Sprite.from(tileTexture);
  }

  return sprite;
}

export function getCellBehaviourImageFilename(
  behaviour: ICellBehaviour,
  worldType: WorldType,
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
      behaviour.hasWorldImage?.() ? `${worldType}/` : ''
    }${behaviour.getImageFilename?.()}${
      behaviour.hasTileset?.() ? '_tileset' : ''
    }${
      worldVariation !== '0' && behaviour.hasWorldVariationImage?.()
        ? '_variation' + worldVariation
        : ''
    }.png`;
  } catch (error) {}

  return filename;
}
