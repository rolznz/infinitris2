import {
  ChallengeCellType,
  getVariationHueRotation,
  IChallenge,
  parseGrid,
  WorldType,
  WorldVariation,
  WorldVariationValues,
  wrap,
} from 'infinitris2-models';
import * as Jimp from 'jimp';
import * as functions from 'firebase-functions';
import { getApp } from './firebase';

const clientImagesDirectory = 'https://infinitris.net/client/images';
const clientChallengePreviewBackgroundImagesDirectory = `${clientImagesDirectory}/challenge-previews`;
const clientCellImagesDirectory = `${clientImagesDirectory}/cells`;

export function createChallengePreviewImages(
  challengeId: string,
  challenge: IChallenge
) {
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
  const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

  await uploadImage(buffer, `challenges/${challengeId}/card.png`);
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
        const url = getChallengeCellTypeUrl(
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

// FIXME: this is duplicated from challenge behaviours which is in the core directory (not a package)
// which would require initializing a grid and cells in order to get the image filenames
// functions shouldn't have access to all that unnecessary code, so this should probably be moved to the models package
function getChallengeCellTypeUrl(
  cellType: ChallengeCellType,
  worldType: WorldType = 'grass',
  worldVariation: WorldVariation = '0'
): string | undefined {
  worldType = 'grass'; // TODO: remove hardcoding once other world assets are available
  switch (cellType) {
    case ChallengeCellType.Full:
      return getChallengeTypeUrlInternal('fill', worldType, worldVariation);
    case ChallengeCellType.RockGenerator:
      return getChallengeTypeUrlInternal(
        'rock-generator',
        worldType,
        worldVariation
      );
    case ChallengeCellType.RedKey:
      return getChallengeTypeUrlInternal('key_red');
    case ChallengeCellType.BlueKey:
      return getChallengeTypeUrlInternal('key_blue');
    case ChallengeCellType.GreenKey:
      return getChallengeTypeUrlInternal('key_green');
    case ChallengeCellType.YellowKey:
      return getChallengeTypeUrlInternal('key_yellow');
    case ChallengeCellType.RedLock:
      return getChallengeTypeUrlInternal('lock_red');
    case ChallengeCellType.BlueLock:
      return getChallengeTypeUrlInternal('lock_blue');
    case ChallengeCellType.GreenLock:
      return getChallengeTypeUrlInternal('lock_green');
    case ChallengeCellType.YellowLock:
      return getChallengeTypeUrlInternal('lock_yellow');
    case ChallengeCellType.ReverseRedLock:
      return getChallengeTypeUrlInternal('reverse_lock_red');
    case ChallengeCellType.ReverseBlueLock:
      return getChallengeTypeUrlInternal('reverse_lock_blue');
    case ChallengeCellType.ReverseGreenLock:
      return getChallengeTypeUrlInternal('reverse_lock_green');
    case ChallengeCellType.ReverseYellowLock:
      return getChallengeTypeUrlInternal('reverse_lock_yellow');
    case ChallengeCellType.RedSwitch:
      return getChallengeTypeUrlInternal('switch_red_on');
    case ChallengeCellType.BlueSwitch:
      return getChallengeTypeUrlInternal('switch_blue_on');
    case ChallengeCellType.GreenSwitch:
      return getChallengeTypeUrlInternal('switch_green_on');
    case ChallengeCellType.YellowSwitch:
      return getChallengeTypeUrlInternal('switch_yellow_on');
    case ChallengeCellType.Checkpoint:
      return getChallengeTypeUrlInternal('checkpoint');
    case ChallengeCellType.SpawnLocation:
      return getChallengeTypeUrlInternal('spawn');
    case ChallengeCellType.Finish:
      return getChallengeTypeUrlInternal('finish');
    case ChallengeCellType.Infection:
      return getChallengeTypeUrlInternal('virus', worldType, worldVariation);
    case ChallengeCellType.Wafer:
      return getChallengeTypeUrlInternal('wafer');
    case ChallengeCellType.Deadly:
      return getChallengeTypeUrlInternal('deadly', worldType, worldVariation);
    case ChallengeCellType.GestureMoveLeft:
      return getChallengeTypeUrlInternal('gesture_left');
    case ChallengeCellType.GestureMoveRight:
      return getChallengeTypeUrlInternal('gesture_right');
    case ChallengeCellType.GestureMoveDown:
      return getChallengeTypeUrlInternal('gesture_down');
    case ChallengeCellType.GestureDrop:
      return getChallengeTypeUrlInternal('gesture_drop');
    case ChallengeCellType.GestureRotateClockwise:
      return getChallengeTypeUrlInternal('gesture_rotate_clockwise');
    case ChallengeCellType.GestureRotateAnticlockwise:
      return getChallengeTypeUrlInternal('gesture_rotate_anticlockwise');
    default:
      return undefined;
  }
}

function getChallengeTypeUrlInternal(
  image: string,
  worldType?: WorldType,
  worldVariation?: WorldVariation
): string {
  return `${clientCellImagesDirectory}/${
    worldType ? worldType + '/' : ''
  }${image}${
    worldVariation && worldVariation !== '0'
      ? `_variation${worldVariation}`
      : ''
  }.png`;
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
