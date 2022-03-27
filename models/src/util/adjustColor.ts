import { hexToRgb } from '@models/util/hexToRgb';
import { rgbToHex } from '@models/util/rgbToHex';
import { rotateColor } from '@models/util/rotateColor';

//https://stackoverflow.com/a/57401891/4562693
export function adjustColor(color: string, amount: number) {
  return (
    '#' +
    color
      .replace(/^#/, '')
      .replace(/../g, (color) =>
        (
          '0' +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
}

export function getBorderColor(color: string) {
  return adjustColor(color, -20);
}

export function getCompositeColors(color: string) {
  let { r, g, b } = hexToRgb(color);

  // isShade approximation https://stackoverflow.com/a/34622484/4562693
  const brightness = Math.min(r, g, b);
  const darkness = Math.max(r, g, b);
  const colorfulness = darkness - brightness;
  const isShade = colorfulness < 20;
  let habitatBaseColor = color;
  //console.log(index, color, colorfulness, isShade, darkness, brightness);

  if (!isShade && colorfulness < 150) {
    const decreaseComponent = (c: number) =>
      Math.max(c - (150 - colorfulness) * 4, 0);
    const increaseComponent = (c: number) =>
      Math.min(c + Math.floor((150 - colorfulness) * 2), 230);
    // make habitat more colorful
    for (let i = 0; i < 2; i++) {
      if (r > g && r > b) {
        habitatBaseColor = rgbToHex(
          increaseComponent(r),
          decreaseComponent(g),
          decreaseComponent(b)
        );
      } else if (g > r && g > b) {
        habitatBaseColor = rgbToHex(
          decreaseComponent(r),
          increaseComponent(g),
          decreaseComponent(b)
        );
      } else {
        habitatBaseColor = rgbToHex(
          decreaseComponent(r),
          decreaseComponent(g),
          increaseComponent(b)
        );
      }
    }
    //console.log('Colorfied');
  }

  if (brightness > 200) {
    habitatBaseColor = adjustColor(habitatBaseColor, -30);
    //console.log('Darkened');
  } else if (brightness < 50) {
    habitatBaseColor = adjustColor(habitatBaseColor, 50);
    //console.log('Brightened');
  }

  const comp1 = isShade
    ? adjustColor(habitatBaseColor, -30)
    : rotateColor(habitatBaseColor, 160);
  const comp1b = isShade
    ? adjustColor(habitatBaseColor, -50)
    : rotateColor(habitatBaseColor, 130);

  const comp2 = isShade
    ? adjustColor(habitatBaseColor, 30)
    : rotateColor(habitatBaseColor, 200);
  const comp2b = isShade
    ? adjustColor(habitatBaseColor, 50)
    : rotateColor(habitatBaseColor, 230);

  return { comp1, comp1b, comp2, comp2b };
}
