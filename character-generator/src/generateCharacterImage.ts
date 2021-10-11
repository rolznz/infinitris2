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
  eyesStartY,
  mouthRandomXMultiplier,
  headgearRandomXMultiplier,
  outputDirectory,
  upsideDownChance,
  blockMask,
  thumbnailSize,
  maskFilename,
  facesDirectory,
  thumnailsDirectory,
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
export async function generateCharacterImage(random: Random, index: number) {
  const maskDimensions = await blockMask.metadata();
  const eyes = await loadImage(
    getPath(pickRandomFilename(random, eyesFilenames))
  );
  const headgear = await loadImage(
    getPath(pickRandomFilename(random, headgearFilenames)),
    (image) => randomFlop(random, image)
  );
  const mouth = await loadImage(
    getPath(pickRandomFilename(random, mouthFilenames)),
    (image) => randomFlop(random, image)
  );

  // each color+pattern combo can only show once
  const color = colors[index % colors.length];
  const patternFilename = patternFilenames[Math.floor(index / colors.length)];

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

  const eyesRandomY = random.next() * eyesRangeY;
  const eyesY = Math.floor(outputSize * (eyesStartY + eyesRandomY));
  const mouthRandomY = outputSize * random.next() * (eyesRangeY - eyesRandomY);
  const mouthRandomX =
    mouth.metadata.width! * (random.next() - 0.5) * mouthRandomXMultiplier;
  const headgearRandomX =
    (outputSize - headgear.metadata.width!) *
    (random.next() - 0.5) *
    headgearRandomXMultiplier;
  const headgearRandomY = random.next() * eyesRandomY;

  const patternComposite = await blockMask
    .composite([
      {
        input: pattern.buffer,
        blend: 'in',
      },
    ])
    .toBuffer();

  const filename = `${facesDirectory}/face${index}.png`;
  const thumbnailFilename = `${thumnailsDirectory}/face${index}.png`;

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
        top: Math.floor(
          eyesY - headgear.metadata.height! * 0.9 + headgearRandomY
        ),
        left: Math.floor(
          (outputSize - headgear.metadata.width!) / 2 + headgearRandomX
        ),
      },
    ])
    .toFile(filename);

  if (random.next() < upsideDownChance) {
    // rare upside down character
    // TODO: why can't the composited image above be flipped?
    const tmpFilename = `${filename}.tmp`;
    await sharp(filename).flip().toFile(tmpFilename);
    fs.rmSync(filename);
    fs.renameSync(tmpFilename, filename);
  }

  // generate thumbnail
  await sharp(filename).resize(thumbnailSize).toFile(thumbnailFilename);
}
