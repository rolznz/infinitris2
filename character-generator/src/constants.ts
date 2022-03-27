import fs from 'fs';
import sharp from 'sharp';
import { colors } from 'infinitris2-models';

export const assetsDirectory = 'assets';
export const outputDirectory = 'out';
export const charactersDirectory = 'out/characters';
export const habitatsDirectory = 'out/habitats';
export const facesDirectory = 'out/faces';
export const definitionsDirectory = 'out/definitions';
export const patternsDirectory = 'out/patterns';

export const files = fs
  .readdirSync(assetsDirectory)
  .filter((file) => file.toLowerCase().endsWith('.svg'));
export const getPath = (filename: string) => `${assetsDirectory}/${filename}`;

export const patternFilenames = files.filter((file) =>
  file.startsWith('pattern_')
);
export const earsFilenames = files.filter((file) => file.startsWith('ears_'));
export const eyesFilenames = files.filter((file) => file.startsWith('eyes_'));
export const mouthFilenames = files.filter((file) => file.startsWith('mouth_'));
export const headgearFilenames = files.filter((file) =>
  file.startsWith('headgear_')
);

export const outputSize = 512;
export const patternSize = 256;
export const thumbnailSize = 64;
export const numCombinations = colors.length * patternFilenames.length;
export const borderFilename = 'block_border.svg';
export const maskFilename = 'block_mask.svg';

export const sharpOptions: sharp.SharpOptions = {
  density: 280,
};

export const blockMask = sharp(getPath(maskFilename), sharpOptions);

export const headgearStartY = 0.15;
export const noHeadgearStartY = 0.3;
export const eyesRangeY = 0.2;
export const paddingY = 0.11;
export const earsStartY = 0.3;
export const earsRangeY = 0.2;
export const availableY = 1 - paddingY * 2;
export const mouthRandomXMultiplier = 0.07;
export const headgearRandomXMultiplier = 0.5;
export const upsideDownChance = 0.025; // chance of flipping the character

export const earsChance = 0.5;
export const headgearChance = 0.2;
export const headgearRandomYMultiplier = 0.2;

export const habitatPreview = false;
