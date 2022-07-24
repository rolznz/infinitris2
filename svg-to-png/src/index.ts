import fs from 'fs';
import sharp from 'sharp';
import jimp from 'jimp';

const pngExt = '.png';
const jpgExt = '.jpg';

const chosenExt = process.env.EXTENSION || pngExt;

const assetsDirectory =
  chosenExt === pngExt
    ? `../client/www/images/${process.env.ASSETS_DIRECTORY || 'worlds'}`
    : '../app/src/components/ui/GameModePicker';

const childAssetDirectories =
  process.env.READ_CHILD_DIRECTORIES !== 'false'
    ? fs
        .readdirSync(assetsDirectory)
        .map((filename) => `${assetsDirectory}/${filename}`)
        .filter((path) => fs.lstatSync(path).isDirectory())
    : [assetsDirectory];

for (const assetDirectory of childAssetDirectories) {
  if (
    process.env.DIR_FILTER &&
    assetDirectory.indexOf(process.env.DIR_FILTER) < 0
  ) {
    continue;
  }
  const files = fs
    .readdirSync(assetDirectory)
    .filter((file) => file.toLowerCase().endsWith('.svg'));

  const getPath = (filename: string) => `${assetDirectory}/${filename}`;

  (async () => {
    for (const filename of files) {
      if (
        process.env.FILE_FILTER &&
        filename.indexOf(process.env.FILE_FILTER) < 0
      ) {
        continue;
      }
      const withoutExt = filename.substring(0, filename.length - 4);
      const outputFilename = withoutExt + chosenExt;
      await sharp(getPath(filename)).toFile(getPath(outputFilename));
      // generate alternate hues
      if (process.env.GENERATE_VARIATIONS !== 'false' && chosenExt === pngExt) {
        for (let variation = 1; variation < 6; variation++) {
          await colorSpin(
            getPath(outputFilename),
            getPath(withoutExt + '_variation' + variation + chosenExt),
            variation
          );
        }
      }
      console.log(filename);
    }
  })();
}

async function colorSpin(
  inputFilename: string,
  outputFilename: string,
  index: number
) {
  const hueVariation =
    index === 0 ? 0 : Math.ceil(index / 2) * (index % 2 === 1 ? 1 : -1);
  const hueRotation =
    hueVariation * (index < 3 ? 22.5 : index < 4 ? 45 + 22.5 : 90);

  // Reading Image
  const image = await jimp.read(inputFilename);
  image.color([{ apply: 'hue', params: [hueRotation] }]).write(outputFilename);
}
