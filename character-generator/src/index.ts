import random from 'random';
import { clearDirectory } from './utils/clearDirectory';
import {
  definitionsDirectory,
  facesDirectory,
  numCombinations,
  outputDirectory,
  patternsDirectory,
  patternFilenames,
  getPath,
  patternSize,
  charactersDirectory,
  habitatsDirectory,
} from './constants';
import { generateCharacterImage as generateCharacterImages } from './generateCharacterImage';
import { generateCharacterNames } from './generateCharacterNames';
import fs from 'fs';
import sharp from 'sharp';
const seedrandom = require('seedrandom');

random.use(seedrandom('gen-1'));
clearDirectory(outputDirectory);
clearDirectory(facesDirectory);
clearDirectory(charactersDirectory);
clearDirectory(definitionsDirectory);
clearDirectory(patternsDirectory);
clearDirectory(habitatsDirectory);

console.log('Generating names');
const names = generateCharacterNames(random);

if (names.length < numCombinations) {
  throw new Error('Not enough names generated');
}

(async () => {
  console.log('Exporting patterns');
  for (const filename of patternFilenames) {
    await sharp(getPath(filename))
      .resize(patternSize)
      .toFile(
        `${patternsDirectory}/${filename.substring(0, filename.length - 3)}png`
      );
  }

  console.log('Generating characters');
  await generateCharacters();
  console.log('Done');
})();

async function generateCharacters() {
  for (let i = 0; i < Math.min(numCombinations, 23); i++) {
    const name = names[i];
    const createCharacterResult = await generateCharacterImages(random, i);

    // TODO: JSON export character

    const character = {
      id: i,
      name,
      ...createCharacterResult,
    };
    fs.writeFileSync(
      `${definitionsDirectory}/${i}.json`,
      JSON.stringify(character)
    );

    process.stdout.write('.');
  }
}

// TODO: upload characters
