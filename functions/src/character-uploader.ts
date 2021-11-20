import { getApp, getDb } from './utils/firebase';
import { readdirSync, readFileSync } from 'fs';

const inputDir = '../character-generator/out';
const patternsDir = `${inputDir}/patterns`;
const definitionsDirectory = `${inputDir}/definitions`;

const uploadFile = (src: string, destination: string) =>
  getApp().storage().bucket('infinitris2-images').upload(src, {
    destination,
    public: true,
  });

const patternFilenames = readdirSync(patternsDir).filter((filename) =>
  filename.endsWith('.png')
);

const characterFilenames = readdirSync(definitionsDirectory).filter(
  (filename) => filename.endsWith('.json')
);

for (const filename of patternFilenames) {
  uploadFile(`${patternsDir}/${filename}`, `patterns/${filename}`);
}
for (const filename of characterFilenames) {
  const contents = JSON.parse(
    readFileSync(`${definitionsDirectory}/${filename}`).toString()
  );
  const id = parseInt(filename.substring(0, filename.indexOf('.')));

  console.log(contents);
  getDb().doc(`characters/${id}`).set(contents);

  const imageFilename = `${id}.png`;
  uploadFile(
    `${inputDir}/faces/${imageFilename}`,
    `characters/faces/${imageFilename}`
  );
  uploadFile(
    `${inputDir}/thumbnails/${imageFilename}`,
    `characters/thumbnails/${imageFilename}`
  );
}
