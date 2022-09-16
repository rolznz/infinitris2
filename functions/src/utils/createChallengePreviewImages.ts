import {
  ChallengeCellType,
  clientChallengePreviewBackgroundImagesDirectory,
  getCellTypePreviewImageUrl,
  getChallengePath,
  getVariationHueRotation,
  IChallenge,
  objectToDotNotation,
  parseGrid,
  WorldType,
  wrap,
} from 'infinitris2-models';
import * as Jimp from 'jimp';
import * as functions from 'firebase-functions';
import { getApp, getDb } from './firebase';

export function createChallengePreviewImages(
  challengeId: string,
  challenge: IChallenge
) {
  console.log('Generating challenge preview images', challengeId);
  // TODO: multiple variations (card, landscape full, portrait full)
  // only the card should have the BG set

  return Promise.all([
    createChallengePreviewImage(challengeId, challenge, 'card'),
  ]);
}

async function createChallengePreviewImage(
  challengeId: string,
  challenge: IChallenge,
  variation = 'card'
) {
  // TODO: multiple variations (card, landscape full, portrait full)

  const aspectRatio = 3 / 4;
  let image = await getBackgroundImage(
    challenge.worldType || 'grass',
    aspectRatio
  );
  if ((challenge.worldVariation || '0') !== '0') {
    const hueRotation = getVariationHueRotation(
      WorldVariationValues.indexOf(challenge.worldVariation || '0')
    );
    image = image.color([{ apply: 'hue', params: [hueRotation] }]);
  }
  image = await placeCells(image, challengeId, challenge, aspectRatio);
  const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

  const thumbnailSize = 64;
  const thumbnail = await image
    .resize(thumbnailSize, Math.floor(thumbnailSize * (1 / aspectRatio)))
    .getBase64Async(Jimp.MIME_JPEG);

  await uploadImage(buffer, `challenges/${challengeId}/card.jpg`);

  const updateChallenge = objectToDotNotation<IChallenge>(
    {
      readOnly: {
        thumbnail,
      },
    },
    ['readOnly.thumbnail']
  );
  await getDb().doc(getChallengePath(challengeId)).update(updateChallenge);
}
function cropImage(image: Jimp, aspectRatio: number): Jimp {
  const width = image.getWidth();
  const oldHeight = image.getHeight();
  const newHeight = width * (1 / aspectRatio);
  return image.crop(0, (oldHeight - newHeight) * 0.5, width, newHeight);
}

function uploadImage(buffer: Buffer, destination: string) {
  const bucketName = functions.config().webhooks.images_bucket;
  if (!bucketName) {
    throw new Error('No images_bucket set');
  }

  return getApp().storage().bucket(bucketName).file(destination).save(buffer, {
    public: true,
  });
}
async function placeCells(
  image: Jimp,
  challengeId: string,
  challenge: IChallenge,
  aspectRatio: number
): Promise<Jimp> {
  if (typeof challenge.grid !== 'string') {
    // skip generation for empty grids
    return image;
  }

  let cellTypes: ChallengeCellType[][];
  try {
    cellTypes = parseGrid(challenge.grid);
  } catch (error) {
    console.error('Failed to parse grid for challenge ' + challengeId);
    return image;
  }
  // numRows = allRows ? cellTypes.length : numRows;
  const numRows = 16;
  const numColumns = Math.round(numRows * aspectRatio);
  const width = image.getWidth();
  const height = image.getHeight();

  const cellWidth = width / numColumns;
  const cellHeight = height / numRows; // FIXME: why are both needed, the cell size should be SQUARE
  if (cellWidth !== cellHeight) {
    throw new Error(
      'Cell width (' +
        cellWidth +
        ') does not match cell height (' +
        cellHeight +
        ')'
    );
  }

  const spawnLocationCellPosition = { row: 0, column: 0 };
  for (let r = 0; r < cellTypes.length; r++) {
    for (let c = 0; c < cellTypes[0].length; c++) {
      if (cellTypes[r][c] === ChallengeCellType.SpawnLocation) {
        spawnLocationCellPosition.row = r;
        spawnLocationCellPosition.column = c;
        break;
      }
    }
  }
  if (spawnLocationCellPosition.row + numRows > cellTypes.length) {
    spawnLocationCellPosition.row = Math.max(cellTypes.length - numRows, 0);
  }

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numColumns; c++) {
      const unwrappedRow =
        spawnLocationCellPosition.row + r; /* - Math.floor(numRows / 4)*/
      const unwrappedColumn =
        spawnLocationCellPosition.column + c - Math.floor(numColumns / 2);

      const cellType =
        unwrappedRow < cellTypes.length
          ? cellTypes[wrap(unwrappedRow, cellTypes.length)][
              wrap(unwrappedColumn, cellTypes[0].length)
            ]
          : ChallengeCellType.Full;

      if (cellType !== ChallengeCellType.Empty) {
        const url = getCellTypePreviewImageUrl(
          cellType,
          challenge.worldType,
          challenge.worldVariation
        );
        if (url) {
          const cellImage = await getCellImage(url, cellWidth, cellHeight);

          image = image.composite(cellImage, c * cellWidth, r * cellHeight);
        }
      }
    }
  }

  return image;
}

const cellImageCache: { [key: string]: Jimp } = {};
async function getCellImage(
  url: string,
  cellWidth: number,
  cellHeight: number
): Promise<Jimp> {
  let image = cellImageCache[url];
  if (!image) {
    console.log('Downloading cell image: ' + url);
    image = await Jimp.read(url);
    image = image.resize(cellWidth, cellHeight);
    cellImageCache[url] = image;
  }
  return image;
}

const backgroundImageCache: { [key: string]: Jimp } = {};
async function getBackgroundImage(
  worldType: WorldType,
  aspectRatio: number
): Promise<Jimp> {
  const backgroundImageUrl = `${clientChallengePreviewBackgroundImagesDirectory}/${worldType}_mobile.png`;
  let image = backgroundImageCache[backgroundImageUrl];
  if (!image) {
    console.log('Downloading background image: ' + backgroundImageUrl);
    image = await Jimp.read(backgroundImageUrl);
    image = cropImage(image, aspectRatio);
    backgroundImageCache[backgroundImageUrl] = image;
  }
  return image.clone();
}
