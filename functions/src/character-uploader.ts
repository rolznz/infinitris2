import { getApp, getDb } from './utils/firebase';
import { readdirSync, readFileSync } from 'fs';
import * as functions from 'firebase-functions';

const inputDir = '../character-generator/out';
const patternsDir = `${inputDir}/patterns`;
const definitionsDirectory = `${inputDir}/definitions`;
const bucketName = functions.config().webhooks.images_bucket;
if (!bucketName) {
  throw new Error('No images_bucket set');
}

const uploadFile = (src: string, destination: string) =>
  getApp().storage().bucket(bucketName).upload(src, {
    destination,
    public: true,
  });

const patternFilenames = readdirSync(patternsDir).filter((filename) =>
  filename.endsWith('.png')
);

const characterFilenames = readdirSync(definitionsDirectory).filter(
  (filename) => filename.endsWith('.json')
);
console.log('Uploading patterns');
(async () => {
  for (const filename of patternFilenames) {
    await uploadFile(`${patternsDir}/${filename}`, `patterns/${filename}`);
    process.stdout.write('.');
  }
})();
console.log('Uploading ' + characterFilenames.length + ' characters');
let index = 0;
(async () => {
  for (const filename of characterFilenames) {
    // console.log(filename);
    const promises: Promise<any>[] = [];
    const contents = JSON.parse(
      readFileSync(`${definitionsDirectory}/${filename}`).toString()
    );
    const id = parseInt(filename.substring(0, filename.indexOf('.')));

    // console.log(contents);
    promises.push(
      getDb().doc(`characters/${id}`).set(contents, { merge: true })
    );

    const imageFilename = `${id}.png`;
    const thumbnailFilename = `${id}_thumbnail.png`;
    const habitatFilename = `${id}.svg`;
    promises.push(
      uploadFile(
        `${inputDir}/characters/${imageFilename}`,
        `characters/${imageFilename}`
      )
    );
    promises.push(
      uploadFile(
        `${inputDir}/characters/${thumbnailFilename}`,
        `characters/${thumbnailFilename}`
      )
    );
    promises.push(
      uploadFile(`${inputDir}/faces/${imageFilename}`, `faces/${imageFilename}`)
    );
    promises.push(
      uploadFile(
        `${inputDir}/habitats/${habitatFilename}`,
        `habitats/${habitatFilename}`
      )
    );
    await Promise.all(promises);
    process.stdout.write('.');
    if (++index % 100 === 0) {
      console.log(index + ' / ' + characterFilenames.length);
    }
  }
})();
