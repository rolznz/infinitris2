import { RecursiveKeyOf } from './recursiveKeyOf';
import { RecursivePartial } from './recursivePartial';

// TODO: improve typing to force obj to match allowedKeys rather than having to check at runtime
export function objectToDotNotation<T extends Object>(
  obj: RecursivePartial<Required<T>>,
  allowedKeys: RecursiveKeyOf<Required<T>>[]
) {
  const result = objectToDotNotationInternal(obj, allowedKeys);
  const resultKeys = Object.keys(result);
  if (resultKeys.sort().join(',') !== allowedKeys.sort().join(',')) {
    throw new Error(
      `Unexpected result: ${JSON.stringify(resultKeys)} != ${JSON.stringify(
        allowedKeys
      )}`
    );
  }

  return result;
}

// inspired by https://stackoverflow.com/a/54907553/4562693
function objectToDotNotationInternal<T extends Object>(
  obj: any,
  allowedKeys: RecursiveKeyOf<T>[],
  parent: string[] = [],
  keyValue: { [key: string]: T[Extract<keyof T, string>] } = {}
): { [key: string]: Object } {
  for (const key in obj) {
    const pathParts = [...parent, key];
    const fullPath = pathParts.join('.');
    if (allowedKeys.indexOf(fullPath as RecursiveKeyOf<T>) >= 0) {
      keyValue[fullPath] = obj[key];
      continue;
    } else if (obj[key] !== null && typeof obj[key] === 'object') {
      Object.assign(
        keyValue,
        objectToDotNotationInternal(obj[key], allowedKeys, pathParts, keyValue)
      );
    }
  }
  return keyValue;
}
