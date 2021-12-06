export function rgbToHex(r: number, g: number, b: number) {
  // Convert r b and g values to hex
  const newRgb = b | (g << 8) | (r << 16);
  return '#' + (0x1000000 | newRgb).toString(16).substring(1);
}
