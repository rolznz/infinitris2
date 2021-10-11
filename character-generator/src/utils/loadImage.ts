import sharp from 'sharp';
import { sharpOptions } from '../constants';

export async function loadImage(
  input: string | Buffer,
  postProcessImage?: (image: sharp.Sharp) => sharp.Sharp
) {
  let image = await sharp(input, sharpOptions);
  if (postProcessImage) {
    image = postProcessImage(image);
  }

  const metadata = await image.metadata();
  const buffer = await image.toBuffer();

  return { image, metadata, buffer };
}
