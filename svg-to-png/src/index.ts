import fs from 'fs';
import sharp from 'sharp';
import jimp from 'jimp';

const worldsDirectory = '../client/www/images/worlds';
const pngExt = '.png';

const assetsDirectories = fs
  .readdirSync(worldsDirectory)
  .map((filename) => `${worldsDirectory}/${filename}`)
  .filter((path) => fs.lstatSync(path).isDirectory());

for (const assetDirectory of assetsDirectories) {
  const files = fs
    .readdirSync(assetDirectory)
    .filter((file) => file.toLowerCase().endsWith('.svg'));

  const getPath = (filename: string) => `${assetDirectory}/${filename}`;

  (async () => {
    for (const filename of files) {
      const withoutExt = filename.substring(0, filename.length - 4);
      const png = withoutExt + pngExt;
      await sharp(getPath(filename)).toFile(getPath(png));
      // generate alternate hues
      for (let variation = 1; variation < 6; variation++) {
        await colorSpin(
          getPath(png),
          getPath(withoutExt + '_variation' + variation + pngExt),
          variation
        );
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
