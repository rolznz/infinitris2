import fs from 'fs';

export function colorizeSvg(filename: string, color: string) {
  return Buffer.from(
    fs
      .readFileSync(filename)
      .toString()
      .replace(new RegExp(`fill="#FFFFFF"`, 'g'), `fill="${color}"`)
  );
}
