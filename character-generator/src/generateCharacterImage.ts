import { Random } from 'random';
import sharp from 'sharp';
import { colors } from './colors';
import fs from 'fs';
import {
  getPath,
  eyesFilenames,
  headgearFilenames,
  mouthFilenames,
  patternFilenames,
  borderFilename,
  borderAdjustAmount,
  eyesRangeY,
  outputSize,
  mouthRandomXMultiplier,
  headgearRandomXMultiplier,
  blockMask,
  thumbnailSize,
  maskFilename,
  facesDirectory,
  thumnailsDirectory,
  headgearStartY,
  paddingY,
  availableY,
} from './constants';
import { adjustColor } from './utils/adjustColor';
import { colorizeSvg } from './utils/colorizeSvg';
import { loadImage } from './utils/loadImage';

const pickRandomFilename = (random: Random, filenames: string[]) =>
  filenames[random.int(0, filenames.length - 1)];

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
};

export async function generateCharacterImage(
  random: Random,
  index: number
): Promise<CharacterImageResult> {
  let price = 0;
  const maskDimensions = await blockMask.metadata();
  const eyesFilename = pickRandomFilename(random, eyesFilenames);
  price += getPrice(eyesFilename);
  const eyes = await loadImage(getPath(eyesFilename));
  const headgearFilename = pickRandomFilename(random, headgearFilenames);
  price += getPrice(headgearFilename);
  const headgear = await loadImage(getPath(headgearFilename), (image) =>
    randomFlop(random, image)
  );

  const mouthFilename = pickRandomFilename(random, mouthFilenames);
  const mouth = await loadImage(getPath(mouthFilename), (image) =>
    randomFlop(random, image)
  );
  price += getPrice(mouthFilename);

  // each color+pattern combo can only show once
  const color = colors[index % colors.length];

  const patternFilename = patternFilenames[Math.floor(index / colors.length)];
  price += getPrice(patternFilename);

  price *= 1 + Math.pow(color.price, 2);

  const border = await loadImage(
    colorizeSvg(
      getPath(borderFilename),
      adjustColor(color.hex, borderAdjustAmount)
    )
  );

  const skin = await loadImage(colorizeSvg(getPath(maskFilename), color.hex));

  const pattern = await loadImage(getPath(patternFilename), (image) =>
    image.resize(maskDimensions.width, maskDimensions.height)
  );

  const mouthRandomX =
    mouth.metadata.width! *
    (random.next() - 0.5) *
    (getCustomXMultiplier(mouthFilename) ?? mouthRandomXMultiplier);
  const headgearRandomX =
    (outputSize - headgear.metadata.width!) *
    (random.next() - 0.5) *
    (getCustomXMultiplier(headgearFilename) ?? headgearRandomXMultiplier);
  const headgearOffsetY =
    headgearStartY *
    outputSize; /* + (getCustomY(headgearFilename) ?? 0) * outputSize*/
  const headgearRandomY =
    random.next() *
    (getCustomYMultiplier(headgearFilename) ?? 0.2) *
    (availableY - headgear.metadata.height! * 4);

  const headgearY = headgearOffsetY + headgearRandomY;
  const eyesStartY = headgearY + headgear.metadata.height!;

  const eyesRandomY = random.next() * eyesRangeY * availableY;

  const eyesY = eyesStartY + eyesRandomY;

  const mouthRandomY =
    Math.max(
      outputSize - outputSize * paddingY * 2 - eyesY - eyes.metadata.height!,
      0
    ) * random.next();

  const patternComposite = await blockMask
    .composite([
      {
        input: pattern.buffer,
        blend: 'in',
      },
    ])
    .toBuffer();

  const filename = `${facesDirectory}/${index}.png`;
  const thumbnailFilename = `${thumnailsDirectory}/${index}.png`;

  await sharp({
    create: {
      width: outputSize,
      height: outputSize,
      channels: 4,
      background: '#ffffff00',
    },
  })
    .composite([
      {
        input: skin.buffer,
      },
      {
        input: border.buffer,
      },
      {
        input: patternComposite,
      },
      {
        input: mouth.buffer,
        top: Math.floor(eyesY + eyes.metadata.height! + mouthRandomY),
        left: Math.floor(
          (outputSize - mouth.metadata.width!) / 2 + mouthRandomX
        ),
      },
      {
        input: eyes.buffer,
        top: Math.floor(eyesY),
        left: Math.floor((outputSize - eyes.metadata.width!) / 2),
      },
      {
        input: headgear.buffer,
        top: Math.floor(headgearY),
        left: Math.floor(
          (outputSize - headgear.metadata.width!) / 2 + headgearRandomX
        ),
      },
    ])
    .toFile(filename);

  /*if (random.next() < upsideDownChance) {
    // rare upside down character
    // TODO: why can't the composited image above be flipped?
    const tmpFilename = `${filename}.tmp`;
    await sharp(filename).flip().toFile(tmpFilename);
    fs.rmSync(filename);
    fs.renameSync(tmpFilename, filename);
  }*/

  // generate thumbnail
  await sharp(filename).resize(thumbnailSize).toFile(thumbnailFilename);

  return {
    price,
    color: color.hex,
    patternFilename:
      patternFilename.substring(0, patternFilename.length - 3) + 'png',
  };
}
function getCustomXMultiplier(filename: string): number | undefined {
  const parts = filename.split('_');
  const index = parts.indexOf('rx');
  if (index > 0) {
    return parseFloat(parts[index + 1]);
  } else {
    return undefined;
  }
}
function getCustomYMultiplier(filename: string): number | undefined {
  const parts = filename.split('_');
  const index = parts.indexOf('ry');
  if (index > 0) {
    return parseFloat(parts[index + 1]);
  } else {
    return undefined;
  }
}
function getCustomY(filename: string): number | undefined {
  const parts = filename.split('_');
  const index = parts.indexOf('y');
  if (index > 0) {
    return parseFloat(parts[index + 1]);
  } else {
    return undefined;
  }
}

function getPrice(filename: string): number {
  const parts = filename.split('_');
  const index = parts.indexOf('price');
  if (index > 0) {
    return parseInt(parts[index + 1]);
  } else {
    return 0;
  }
}
