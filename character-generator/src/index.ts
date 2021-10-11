import random from 'random';
import { clearDirectory } from './utils/clearDirectory';
import {
  facesDirectory,
  numCombinations,
  outputDirectory,
  thumnailsDirectory,
} from './constants';
import { generateCharacterImage as generateCharacter } from './generateCharacterImage';
import { generateCharacterNames as generateCharacterNames } from './generateCharacterNames';
const seedrandom = require('seedrandom');

random.use(seedrandom('gen-1'));
clearDirectory(outputDirectory);
clearDirectory(facesDirectory);
clearDirectory(thumnailsDirectory);

console.log('Generating names');
const names = generateCharacterNames(random);

if (names.length < numCombinations) {
  throw new Error('Not enough names generated');
}

console.log('Generating characters');
(async () => {
  await generateCharacters();
  console.log('Done');
})();

async function generateCharacters() {
  for (let i = 0; i < numCombinations; i++) {
    const name = names[i];
    await generateCharacter(random, i);

    // TODO: JSON export character

    process.stdout.write('.');
  }
}

// TODO: upload characters
