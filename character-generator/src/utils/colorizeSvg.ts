import fs from 'fs';

export function colorizeSvg(filename: string, color: string) {
  return Buffer.from(
    fs
      .readFileSync(filename)
      .toString()
      .replace(new RegExp(`#FFFFFF`, 'g'), `${color}`)
  );
}

export function colorizeSvg2(filename: string, color: string, color2: string) {
  return Buffer.from(
    fs
      .readFileSync(filename)
      .toString()
      .replace(new RegExp(`#6FBF44`, 'g'), `${color}`)
      .replace(new RegExp(`#E1E31A`, 'g'), `${color2}`)
  );
}
