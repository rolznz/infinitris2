import fs from 'fs';

export function colorizeSvg(filename: string, color: string) {
  return Buffer.from(
    fs
      .readFileSync(filename)
      .toString()
      .replace(new RegExp(`fill="#FFFFFF"`, 'g'), `fill="${color}"`)
  );
}

export function colorizeSvg2(filename: string, color: string, color2: string) {
  return Buffer.from(
    fs
      .readFileSync(filename)
      .toString()
      .replace(new RegExp(`fill="#6FBF44"`, 'g'), `fill="${color}"`)
      .replace(new RegExp(`fill="#E1E31A"`, 'g'), `fill="${color2}"`)
  );
}
