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
import { adjustColor } from './utils/adjustColor';
import { colorizeSvg, colorizeSvg2 } from './utils/colorizeSvg';
import { loadImage } from './utils/loadImage';
import { mergeSvgs } from './utils/mergeSvgs';
import { rotateColor } from './utils/rotateColor';
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
} from './customizations';
import { hexToRgb } from './utils/hexToRgb';
import { rgbToHex } from './utils/rgbToHex';

const pickRandomFilename = (random: Random, filenames: string[]) => {
  while (true) {
    const filename = filenames[random.int(0, filenames.length - 1)];
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
  const borderColor = adjustColor(color.hex, borderAdjustAmount);

  let { r, g, b } = hexToRgb(color.hex);

  // isShade approximation https://stackoverflow.com/a/34622484/4562693
  const brightness = Math.min(r, g, b);
  const darkness = Math.max(r, g, b);
  const colorfulness = darkness - brightness;
  const isShade = colorfulness < 20;
  let habitatBaseColor = color.hex;
  //console.log(index, color.hex, colorfulness, isShade, darkness, brightness);

  if (!isShade && colorfulness < 150) {
    const decreaseComponent = (c: number) =>
      Math.max(c - (150 - colorfulness) * 4, 0);
    const increaseComponent = (c: number) =>
      Math.min(c + Math.floor((150 - colorfulness) * 2), 230);
    // make habitat more colorful
    for (let i = 0; i < 2; i++) {
      if (r > g && r > b) {
        habitatBaseColor = rgbToHex(
          increaseComponent(r),
          decreaseComponent(g),
          decreaseComponent(b)
        );
      } else if (g > r && g > b) {
        habitatBaseColor = rgbToHex(
          decreaseComponent(r),
          increaseComponent(g),
          decreaseComponent(b)
        );
      } else {
        habitatBaseColor = rgbToHex(
          decreaseComponent(r),
          decreaseComponent(g),
          increaseComponent(b)
        );
      }
    }
    //console.log('Colorfied');
  }

  if (brightness > 200) {
    habitatBaseColor = adjustColor(habitatBaseColor, -30);
    //console.log('Darkened');
  } else if (brightness < 50) {
    habitatBaseColor = adjustColor(habitatBaseColor, 50);
    //console.log('Brightened');
  }

  const comp1 = isShade
    ? adjustColor(habitatBaseColor, -30)
    : rotateColor(habitatBaseColor, 160);
  const comp1b = isShade
    ? adjustColor(habitatBaseColor, -50)
    : rotateColor(habitatBaseColor, 130);

  const comp2 = isShade
    ? adjustColor(habitatBaseColor, 30)
    : rotateColor(habitatBaseColor, 200);
  const comp2b = isShade
    ? adjustColor(habitatBaseColor, 50)
    : rotateColor(habitatBaseColor, 230);

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

  let price = 0;
  price += getPriceFromTier(color.tier);

  const maskDimensions = await blockMask.metadata();
  const earsFilename =
    index !== 0 && random.next() < earsChance
      ? pickRandomFilename(random, earsFilenames)
      : null;
  const eyesFilename =
    index === 0 ? eyesFilenames[0] : pickRandomFilename(random, eyesFilenames);
  price += getPrice(eyesFilename);
  const ears = earsFilename
    ? await loadImage(
        colorizeSvg2(getPath(earsFilename), color.hex, borderColor)
      )
    : null;
  if (earsFilename) {
    price += getPrice(earsFilename);
  }
  const eyes = await loadImage(getPath(eyesFilename));
  const headgearFilename =
    index > 0 && hasHeadgear(eyesFilename) && random.next() < headgearChance
      ? pickRandomFilename(random, headgearFilenames)
      : null;
  price += headgearFilename ? getPrice(headgearFilename) : 0;
  const headgear = headgearFilename
    ? await loadImage(getPath(headgearFilename), (image) =>
        randomFlop(random, image)
      )
    : null;

  const mouthFilename =
    index === 0
      ? mouthFilenames[0]
      : pickRandomFilename(random, mouthFilenames);
  const mouth = hasMouth(eyesFilename)
    ? await loadImage(getPath(mouthFilename), (image) =>
        randomFlop(random, image)
      )
    : null;
  if (mouth) {
    price += getPrice(mouthFilename);
  }

  const patternFilename = patternFilenames[Math.floor(index / colors.length)];
  price += getPrice(patternFilename);

  const border = await loadImage(
    colorizeSvg(getPath(borderFilename), borderColor)
  );

  const skin = await loadImage(colorizeSvg(getPath(maskFilename), color.hex));

  const pattern = await loadImage(getPath(patternFilename), (image) =>
    image.resize(maskDimensions.width, maskDimensions.height)
  );

  const mouthRandomX = mouth
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

  const eyesStartY = headgear
    ? headgearY +
      headgear.metadata.height! +
      (getPushY(headgearFilename!) ?? 0) * outputSize
    : noHeadgearStartY * outputSize;

  const eyesAvailableRandomY =
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
    ? earsStartY * outputSize +
      random.next() *
        Math.max(0, earsRangeY * outputSize - ears.metadata.height!)
    : 0;

  const mouthRandomY =
    Math.max(
      (availableY - paddingY * 2) * outputSize -
        eyesY -
        eyes.metadata.height! -
        (mouth?.metadata.height || 0) -
        (headgear?.metadata.height || 0),
      0
    ) * random.next();

  const mouthY = mouth
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

  const blockFilename = `${charactersDirectory}/${index}.png`;
  const habitatFilename = `${habitatsDirectory}/${index}.svg`;
  const thumbnailFilename = `${charactersDirectory}/${index}_thumbnail.png`;
  const faceFilename = `${facesDirectory}/${index}.png`;

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
