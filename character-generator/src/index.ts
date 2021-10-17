import random from 'random';
import { clearDirectory } from './utils/clearDirectory';
import {
  charactersDirectory,
  facesDirectory,
  numCombinations,
  outputDirectory,
  thumnailsDirectory,
  patternsDirectory,
  patternFilenames,
  getPath,
  patternSize,
} from './constants';
import { generateCharacterImage } from './generateCharacterImage';
import { generateCharacterNames } from './generateCharacterNames';
import fs from 'fs';
import sharp from 'sharp';
const seedrandom = require('seedrandom');

random.use(seedrandom('gen-1'));
clearDirectory(outputDirectory);
clearDirectory(facesDirectory);
clearDirectory(thumnailsDirectory);
clearDirectory(charactersDirectory);
clearDirectory(patternsDirectory);

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
  for (let i = 0; i < numCombinations; i++) {
    const name = names[i];
    const createCharacterResult = await generateCharacterImage(random, i);

    // TODO: JSON export character

    const character = {
      id: i,
      name,
      ...createCharacterResult,
    };
    fs.writeFileSync(
      `${charactersDirectory}/${i}.json`,
      JSON.stringify(character)
    );

    process.stdout.write('.');
  }
}

// TODO: upload characters
