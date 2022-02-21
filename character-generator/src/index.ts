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
  files,
} from './constants';
import { generateCharacterImage } from './generateCharacterImage';
import { generateCharacterNames } from './generateCharacterNames';
import fs from 'fs';
import sharp from 'sharp';
import { getPrice } from './customizations';
const seedrandom = require('seedrandom');

if (process.env.CHARACTER_ID === undefined) {
  clearDirectory(outputDirectory);
  clearDirectory(facesDirectory);
  clearDirectory(charactersDirectory);
  clearDirectory(definitionsDirectory);
  clearDirectory(patternsDirectory);
  clearDirectory(habitatsDirectory);
}

console.log('checking assets');
const invalidSvgs = [];
for (const filename of files) {
  console.log('Checking ' + filename);
  if (fs.readFileSync(getPath(filename)).indexOf('<image') >= 0) {
    invalidSvgs.push(filename);
  }
  // check a price exists
  if (
    filename.startsWith('pattern') ||
    filename.startsWith('ears') ||
    filename.startsWith('eyes') ||
    filename.startsWith('headgear') ||
    filename.startsWith('mouth')
  )
    getPrice(filename);
}
if (invalidSvgs.length > 0) {
  throw new Error(
    'Error: svg assets should not contain images: ' + invalidSvgs.join(', ')
  );
}

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
    if (
      process.env.CHARACTER_ID !== undefined &&
      i.toString() !== process.env.CHARACTER_ID
    ) {
      continue;
    }

    random.use(seedrandom('gen-1-' + i));
    const name = names[i];
    const createCharacterResult = await generateCharacterImage(random, i);

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
