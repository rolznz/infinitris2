import sharp from 'sharp';
import fs from 'fs';
import random from 'random';
const seedrandom = require('seedrandom');

//sharp('./assets/skin_1.svg');

const assetsDirectory = 'assets';
const outputDirectory = 'out';

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

const files = fs.readdirSync(assetsDirectory);
const getFile = (filename: string) => `${assetsDirectory}/${filename}`;

const skinFilenames = files.filter((file) => file.startsWith('skin_'));
const eyesFilenames = files.filter((file) => file.startsWith('eyes_'));
const mouthFilenames = files.filter((file) => file.startsWith('mouth_'));
const noseFilenames = files.filter((file) => file.startsWith('nose_'));
const headgearFilenames = files.filter((file) => file.startsWith('headgear_'));

const outputSize = 256;
const padding = 28;

random.use(seedrandom('gen-1'));

console.log('Making faces');
(async () => {
  for (let i = 1; i < 10; i++) {
    const skinFilename = skinFilenames[random.int(0, skinFilenames.length - 1)];
    const eyesFilename = eyesFilenames[random.int(0, eyesFilenames.length - 1)];
    const noseFilename = noseFilenames[random.int(0, noseFilenames.length - 1)];
    const mouthFilename =
      mouthFilenames[random.int(0, mouthFilenames.length - 1)];
    const skin = await sharp(getFile(skinFilename))
      .resize(outputSize - padding, outputSize - padding)
      .toBuffer();
    const eyes = await sharp(`assets/${eyesFilename}`);

    const eyesHeight = (await eyes.metadata()).height;
    const eyesBuffer = await eyes
      .resize(outputSize - padding, outputSize - padding)
      .toBuffer();

    const noseBuffer = await sharp(`assets/${noseFilename}`)
      .resize(outputSize - padding, outputSize - padding)
      .toBuffer();

    const mouthBuffer = await sharp(`assets/${mouthFilename}`)
      .resize(outputSize - padding, outputSize - padding)
      .toBuffer();

    sharp({
      create: {
        width: outputSize,
        height: outputSize,
        channels: 4,
        background: '#00000000',
      },
    })
      .composite([
        {
          input: skin,
        },
        {
          input: noseBuffer,
          //top: eyesHeight,
          //left: 0,
        },
        {
          input: mouthBuffer,
          //top: eyesHeight,
          //left: 0,
        },
        {
          input: eyesBuffer,
        },
      ])
      .toFile(`${outputDirectory}/face${i}.png`);

    process.stdout.write('.');
  }
  console.log('Done');
})();

//.resize(320, 320).toFile('out/output.png');
