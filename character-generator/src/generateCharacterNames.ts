import { Random } from 'random';

const BadWordFilter = require('bad-words');
const badWordFilter = new BadWordFilter();

const vowels = ['a', '!e', 'i', 'o', 'u'];
const consonants = [
  'b',
  'd',
  'f',
  'g',
  'h!',
  'j!',
  'k',
  'l',
  'm!',
  'n!',
  'p',
  'r',
  's',
  't',
  'v!',
  'w',
  'y',
  'z',
];

const parts = ([] as string[]).concat(
  ...consonants.map((c) => vowels.map((v) => c + v))
);

export function generateCharacterNames(
  random: Random,
  numCombinations: number
) {
  const getPart = (index: number) => {
    let part = '';
    do {
      part = parts[random.integer(0, parts.length - 1)];
    } while (
      (index === 0 && part[0] === '!') ||
      (index === 1 && part[1] === '!')
    );
    return part.replace(/!/g, '');
  };
  const names: string[] = [];
  for (let i = 0; i < numCombinations; i++) {
    let name = '';
    // filter out bad words and duplicates
    do {
      name = getPart(0) + getPart(1);
    } while (
      (badWordFilter.clean(name) as string).indexOf('*') >= 0 ||
      names.indexOf(name) >= 0
    );
    names.push(name);
  }

  return names;
}
