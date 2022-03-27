export function hexToRgb(hex: string) {
  // Convert hex to rgb
  // Credit to Denis http://stackoverflow.com/a/36253499/4939630
  const rgbString =
    'rgb(' +
    (hex = hex.replace('#', ''))
      .match(new RegExp('(.{' + hex.length / 3 + '})', 'g'))!
      .map(function (l) {
        return parseInt(hex.length % 2 ? l + l : l, 16);
      })
      .join(',') +
    ')';

  // Get array of RGB values
  const rgb = rgbString.replace(/[^\d,]/g, '').split(',');

  const r = parseInt(rgb[0]),
    g = parseInt(rgb[1]),
    b = parseInt(rgb[2]);
  return { r, g, b };
}
