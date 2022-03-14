import fs from 'fs';
import sharp from 'sharp';

// TODO: support multiple directories
const assetsDirectory = '../client/www/images/worlds/grass';

export const files = fs
  .readdirSync(assetsDirectory)
  .filter((file) => file.toLowerCase().endsWith('.svg'));

const getPath = (filename: string) => `${assetsDirectory}/${filename}`;

(async () => {
  for (const filename of files) {
    await sharp(getPath(filename)).toFile(
      getPath(filename.substring(0, filename.length - 3) + 'png')
    );
    console.log(filename);
  }
})();
