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

export function colorizeSvg3(
  filename: string,
  color: string,
  color2: string,
  color3: string
) {
  return Buffer.from(
    fs
      .readFileSync(filename)
      .toString()
      .replace(new RegExp(`#E0E31F`, 'g'), `${color}`)
      .replace(new RegExp(`#94C93E`, 'g'), `${color2}`)
      .replace(new RegExp(`#72BF44`, 'g'), `${color3}`)
  );
}

export function colorizeSvg5(
  filename: string,
  color: string,
  color2: string,
  color3: string,
  color4: string,
  color5: string
) {
  return Buffer.from(
    fs
      .readFileSync(filename)
      .toString()
      .replace(new RegExp(`#72BF44`, 'g'), `${color}`)
      .replace(new RegExp(`#7DC242`, 'g'), `${color2}`)
      .replace(new RegExp(`#98CA3D`, 'g'), `${color3}`)
      .replace(new RegExp(`#C2D830`, 'g'), `${color4}`)
      .replace(new RegExp(`#E0E31F`, 'g'), `${color5}`)
  );
}
