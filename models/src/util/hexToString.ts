export function hexToString(hex: number): string {
  const hexString = hex.toString(16);

  return `#${'000000'.substring(0, 6 - hexString.length) + hexString}`;
}
