import fs from 'fs';

const prefix = 'cache/';
const suffix = '.json';
export async function cachedGet<T>(
  key: string,
  fetch: () => Promise<T>
): Promise<T> {
  const filename = `${prefix}${key}${suffix}`;
  try {
    if (!fs.existsSync(prefix)) {
      fs.mkdirSync(prefix);
    }
    if (fs.existsSync(filename)) {
      console.log('Read from cache: ' + filename);
      return JSON.parse(fs.readFileSync(filename).toString()) as T;
    }
  } catch (error) {
    console.error('Failed to access cache', error);
  }
  const uncached = await fetch();
  fs.writeFileSync(filename, JSON.stringify(uncached));
  console.log('Wrote to cache: ' + filename);
  return uncached;
}
