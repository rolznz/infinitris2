// from https://stackoverflow.com/a/53593328/4562693
export function orderedStringify(obj: object) {
  const allKeys = new Set<string>();
  JSON.stringify(obj, (key, _value) => allKeys.add(key));
  return JSON.stringify(obj, Array.from(allKeys).sort(), undefined);
}
