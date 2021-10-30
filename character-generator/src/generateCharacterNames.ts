import { Random } from 'random';

const BadWordFilter = require('bad-words');
const badWordFilter = new BadWordFilter();

const sounds = ['#ee', 'a', 'o', 'i', '#oo', 'u'];
const letters = [
  'b',
  'd',
  'p',
  'f',
  'z',
  'h#',
  't',
  'g',
  'j#',
  '#rg',
  '#nk',
  '#rp',
  'th',
  'w',
  'r',
  'c#',
  'y',
  'k',
  'l',
  'm',
  'n',
  'q#',
  's',
  'v',
  '#x',
];

export function generateCharacterNames(random: Random) {
  let names: string[] = [];
  for (let i = 0; i < 1000; i++) {
    let numParts = 2 + random.int(0, 3);
    let isLetter = random.next() > 0.2;
    for (let j = 0; j < numParts; j++) {
      const source = isLetter ? letters : sounds;
      let next = source[random.int(0, source.length - 1)];
      if (next.endsWith('#')) {
        next = next.substring(0, next.length - 1);
        if (j === numParts - 1) {
          numParts++;
        }
      }
      if (next.startsWith('#')) {
        if (!names[i]) {
          j--;
          continue;
        } else {
          next = next.substring(1);
        }
      }

      names[i] = (names[i] || '') + next;
      isLetter = !isLetter;

      if (j === numParts - 1 && names[i].length < 3) {
        numParts++;
      }
    }
  }

  // filter out bad words and duplicates
  names = [
    ...new Set(
      names
        .map((name) => badWordFilter.clean(name) as string)
        .filter((name) => name.indexOf('*') < 0)
    ),
  ];

  return names;
}
