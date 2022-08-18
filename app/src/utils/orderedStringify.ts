// from https://stackoverflow.com/a/43636793/4562693
const replacer = (key: string, value: any) =>
  value instanceof Object && !(value instanceof Array)
    ? Object.keys(value)
        .sort()
        .reduce((sorted: any, key: string) => {
          sorted[key] = value[key];
          return sorted;
        }, {})
    : value;

export function orderedStringify(obj: object) {
  return JSON.stringify(obj, replacer);
}
