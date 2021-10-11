import fs from 'fs';
import sharp from 'sharp';
import { colors } from './colors';

export const assetsDirectory = 'assets';
export const outputDirectory = 'out';
export const facesDirectory = 'out/faces';
export const thumnailsDirectory = 'out/thumbnails';

export const files = fs.readdirSync(assetsDirectory);
export const getPath = (filename: string) => `${assetsDirectory}/${filename}`;

export const patternFilenames = files.filter((file) =>
  file.startsWith('pattern_')
);
export const eyesFilenames = files.filter((file) => file.startsWith('eyes_'));
export const mouthFilenames = files.filter((file) => file.startsWith('mouth_'));
//export const noseFilenames = files.filter((file) => file.startsWith('nose_'));
export const headgearFilenames = files.filter((file) =>
  file.startsWith('headgear_')
);

export const outputSize = 512;
export const thumbnailSize = 64;
export const numCombinations = colors.length * patternFilenames.length;
export const borderFilename = 'block_border.svg';
export const maskFilename = 'block_mask.svg';

export const sharpOptions: sharp.SharpOptions = {
  density: 280,
};

export const blockMask = sharp(getPath(maskFilename), sharpOptions);

export const eyesStartY = 0.23;
export const eyesRangeY = 0.16;
export const mouthRandomXMultiplier = 0.3;
export const headgearRandomXMultiplier = 0.5;
export const upsideDownChance = 0.025; // chance of flipping the character
export const borderAdjustAmount = -20;
