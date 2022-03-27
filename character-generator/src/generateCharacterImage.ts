import { Random } from 'random';
import sharp from 'sharp';
import fs from 'fs';
import {
  getPath,
  eyesFilenames,
  headgearFilenames,
  mouthFilenames,
  patternFilenames,
  borderFilename,
  eyesRangeY,
  outputSize,
  mouthRandomXMultiplier,
  headgearRandomXMultiplier,
  blockMask,
  thumbnailSize,
  maskFilename,
  facesDirectory,
  headgearStartY,
  paddingY,
  availableY,
  charactersDirectory,
  earsFilenames,
  earsStartY,
  earsRangeY,
  habitatsDirectory,
  earsChance,
  headgearChance,
  noHeadgearStartY,
  habitatPreview,
  headgearRandomYMultiplier,
} from './constants';
import { colorizeSvg, colorizeSvg2 } from './utils/colorizeSvg';
import { loadImage } from './utils/loadImage';
import { mergeSvgs } from './utils/mergeSvgs';
import { rotateColor } from 'infinitris2-models/src/util/rotateColor';
import {
  getPrice,
  getRandomX,
  getRandomY,
  getPriceFromTier,
  getOffsetY,
  getPushY,
  getOffsetX,
  hasMouth,
  hasHeadgear,
  getRarity,
  useHeadgearOffset,
  getEarsY,
  getCustomEyesFilename,
  getCustomMouthFilename,
} from './customizations';
import { colors, getBorderColor, getCompositeColors } from 'infinitris2-models';

const pickRandomFilename = (
  random: Random,
  filenames: string[],
  onlyFree: boolean
) => {
  while (true) {
    const filename = filenames[random.int(0, filenames.length - 1)];
    if (onlyFree && getPrice(filename) > 0) {
      continue;
    }
    const rarity = getRarity(filename);

    // minimum chance is 20%
    if (random.next() > rarity * 0.8) {
      return filename;
    }
  }
};

function randomFlop(random: Random, image: sharp.Sharp): sharp.Sharp {
  if (random.boolean()) {
    return image.flop();
  } else {
    return image;
  }
}

type CharacterImageResult = {
  price: number;
  color: string;
  patternFilename: string;
  thumbnail: string;
};

export async function generateCharacterImage(
  random: Random,
  index: number
): Promise<CharacterImageResult> {
  // each color+pattern combo can only show once
  const color = colors[index % colors.length];
  // TODO: consume models project
  const borderColor = getBorderColor(color.hex);

  const { comp1, comp1b, comp2, comp2b } = getCompositeColors(color.hex);

  const habitatBackgroundSvg = colorizeSvg2(
    getPath('habitat_background.svg'),
    comp1,
    comp1b
  ).toString();
  const habitatGroundSvg = colorizeSvg2(
    getPath('habitat_ground.svg'),
    comp2,
    comp2b
  ).toString();

  const isFreeCharacter = index < 6;
  let price = 0;
  price += getPriceFromTier(color.tier);
  const isEmptyPattern = Math.floor(index / colors.length) === 0;
  const patternFilename = patternFilenames[Math.floor(index / colors.length)];
  price += getPrice(patternFilename);

  const maskDimensions = await blockMask.metadata();
  const earsFilename =
    !isFreeCharacter && random.next() < earsChance
      ? pickRandomFilename(random, earsFilenames, isEmptyPattern)
      : null;
  const eyesFilename =
    getCustomEyesFilename(index) ||
    pickRandomFilename(random, eyesFilenames, isEmptyPattern);
  price += getPrice(eyesFilename);
  const ears = earsFilename
    ? await loadImage(
        colorizeSvg2(getPath(earsFilename), color.hex, borderColor)
      )
    : null;
  if (earsFilename) {
    price += getPrice(earsFilename);
  }
  const eyes = await loadImage(
    colorizeSvg2(getPath(eyesFilename), color.hex, borderColor)
  );
  const headgearFilename =
    !isFreeCharacter &&
    hasHeadgear(eyesFilename) &&
    random.next() < headgearChance
      ? pickRandomFilename(random, headgearFilenames, isEmptyPattern)
      : null;
  price += headgearFilename ? getPrice(headgearFilename) : 0;
  const headgear = headgearFilename
    ? await loadImage(getPath(headgearFilename), (image) =>
        randomFlop(random, image)
      )
    : null;

  const mouthFilename = hasMouth(eyesFilename)
    ? getCustomMouthFilename(index) ||
      pickRandomFilename(random, mouthFilenames, isEmptyPattern)
    : undefined;
  const mouth = mouthFilename
    ? await loadImage(getPath(mouthFilename), (image) =>
        randomFlop(random, image)
      )
    : null;
  if (mouthFilename) {
    price += getPrice(mouthFilename);
  }

  const border = await loadImage(
    colorizeSvg(getPath(borderFilename), borderColor)
  );

  const skin = await loadImage(colorizeSvg(getPath(maskFilename), color.hex));

  const pattern = await loadImage(getPath(patternFilename), (image) =>
    image.resize(maskDimensions.width, maskDimensions.height)
  );

  const mouthRandomX =
    mouth && mouthFilename
      ? mouth.metadata.width! *
        (random.next() - 0.5) *
        (getRandomX(mouthFilename) ?? mouthRandomXMultiplier)
      : 0;
  const headgearRandomX = headgear
    ? (outputSize - headgear!.metadata.width!) *
      (random.next() - 0.5) *
      (getRandomX(headgearFilename!) ?? headgearRandomXMultiplier)
    : 0;
  const headgearOffsetY = headgearFilename
    ? headgearStartY * outputSize +
      (getOffsetY(headgearFilename) ?? 0) * outputSize
    : 0;
  const headgearRandomY = headgear
    ? random.next() *
      (getRandomY(headgearFilename!) ?? headgearRandomYMultiplier) *
      (availableY * outputSize - headgear.metadata.height! * 4)
    : 0;

  const headgearY = headgearOffsetY + headgearRandomY;
  const headgearX = headgear
    ? (outputSize - headgear.metadata.width!) / 2 +
      headgearRandomX +
      (getOffsetX(headgearFilename!) ?? 0) * outputSize
    : 0;

  const eyesStartY =
    headgear && useHeadgearOffset(eyesFilename)
      ? headgearY +
        headgear.metadata.height! +
        (getPushY(headgearFilename!) ?? 0) * outputSize
      : noHeadgearStartY * outputSize;

  const eyesAvailableRandomY =
    (getRandomY(eyesFilename!) ?? 1) *
    eyesRangeY *
    Math.max(
      availableY * outputSize -
        eyes.metadata.height! -
        (mouth?.metadata.height! || 0) -
        (headgear?.metadata?.height || 0),
      0
    );
  const eyesRandomY = random.next() * eyesAvailableRandomY;

  const eyesY =
    eyesStartY + eyesRandomY + (getOffsetY(eyesFilename) ?? 0) * outputSize;

  const earsY = ears
    ? getEarsY(eyesFilename) !== undefined
      ? eyesY + getEarsY(eyesFilename)! * outputSize
      : earsStartY * outputSize +
        random.next() *
          Math.max(0, earsRangeY * outputSize - ears.metadata.height!)
    : 0;

  const mouthRandomY =
    Math.max(
      (availableY - paddingY) * outputSize -
        eyesY -
        eyes.metadata.height! -
        (mouth?.metadata.height || 0) -
        (headgear?.metadata.height || 0),
      0
    ) * random.next();

  const mouthY =
    mouth && mouthFilename
      ? eyesY +
        eyes.metadata.height! +
        mouthRandomY +
        (getPushY(eyesFilename) ?? 0) * outputSize +
        (getOffsetY(mouthFilename) ?? 0) * outputSize
      : 0;

  const patternComposite = await blockMask
    .composite([
      {
        input: pattern.buffer,
        blend: 'in',
      },
    ])
    .toBuffer();

  if (process.env.DEBUG) {
    console.log(
      'Generating ' +
        index +
        '.png: ' +
        [eyesFilename, earsFilename, mouthFilename, headgearFilename]
          .filter((filename) => filename)
          .join(',')
    );
  }

  const blockFilename = `${charactersDirectory}/${index}.png`;
  const habitatFilename = `${habitatsDirectory}/${index}.svg`;
  const thumbnailFilename = `${charactersDirectory}/${index}_thumbnail.png`;
  const faceFilename = `${facesDirectory}/${index}.png`;
  const faceThumbnailFilename = `${facesDirectory}/${index}_thumbnail.png`;

  const characterImages: sharp.OverlayOptions[] = [
    {
      input: skin.buffer,
    },
    {
      input: border.buffer,
    },
    {
      input: patternComposite,
    },
  ];

  const faceImages: sharp.OverlayOptions[] = [
    ...(ears
      ? [
          {
            input: ears.buffer,
            top: Math.floor(earsY),
            left: Math.floor((outputSize - ears.metadata.width!) / 2),
          },
        ]
      : []),
    ...(mouth
      ? [
          {
            input: mouth.buffer,
            top: Math.floor(mouthY),
            left: Math.floor(
              (outputSize - mouth.metadata.width!) / 2 + mouthRandomX
            ),
          },
        ]
      : []),
    {
      input: eyes.buffer,
      top: Math.floor(eyesY),
      left: Math.floor((outputSize - eyes.metadata.width!) / 2),
    },
    ...(headgear
      ? [
          {
            input: headgear!.buffer,
            top: Math.floor(headgearY),
            left: Math.floor(headgearX),
          },
        ]
      : []),
  ];

  await createEmptyImage()
    .composite([...characterImages, ...faceImages])
    .toFile(blockFilename);

  await createEmptyImage()
    .composite([...faceImages])
    .toFile(faceFilename);

  /*if (random.next() < upsideDownChance) {
    // rare upside down character
    // TODO: why can't the composited image above be flipped?
    const tmpFilename = `${filename}.tmp`;
    await sharp(filename).flip().toFile(tmpFilename);
    fs.rmSync(filename);
    fs.renameSync(tmpFilename, filename);
  }*/

  // generate thumbnails
  await sharp(blockFilename).resize(thumbnailSize).toFile(thumbnailFilename);
  await sharp(faceFilename).resize(thumbnailSize).toFile(faceThumbnailFilename);
  // embedded base64 for faster character previews
  const thumbnail = (
    await sharp(blockFilename)
      .resize(thumbnailSize / 4)
      .toBuffer()
  ).toString('base64');

  // generate habitat
  fs.writeFileSync(
    habitatFilename,
    mergeSvgs(habitatBackgroundSvg, habitatGroundSvg)
  );

  if (habitatPreview) {
    await sharp(habitatFilename).toFile(habitatFilename + '.png');
    fs.rmSync(habitatFilename);

    const habitatOrigin = colorizeSvg2(
      getPath('habitat_background.svg'),
      color.hex,
      color.hex
    ).toString();

    const habitatOriginFilename = habitatFilename + '_o';
    // generate habitat from
    fs.writeFileSync(habitatOriginFilename, habitatOrigin);
    // TODO: remove
    await sharp(habitatOriginFilename).toFile(habitatOriginFilename + '.png');
    fs.rmSync(habitatOriginFilename);
  }

  if (isFreeCharacter) {
    price = 0;
  }

  return {
    price,
    color: color.hex,
    patternFilename:
      patternFilename.substring(0, patternFilename.length - 3) + 'png',
    thumbnail,
  };
}

function createEmptyImage() {
  return sharp({
    create: {
      width: outputSize,
      height: outputSize,
      channels: 4,
      background: '#ffffff00',
    },
  });
}
