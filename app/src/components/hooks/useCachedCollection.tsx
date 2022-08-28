import localStorageKeys from '@/utils/localStorageKeys';
import { WithId } from 'infinitris2-models';
import { useCollection, UseCollectionOptions } from 'swr-firestore';

type CachedData<T> = { data: WithId<T>[]; time: number };
const memoryCache: { [key: string]: unknown } = {};

export function useCachedCollection<T>(
  path: string | null,
  options?: UseCollectionOptions,
  expiry = 1000 * 60 * 60 * 24 * 7
): WithId<T>[] | undefined {
  const cachedValueKey =
    localStorageKeys.cache + '_' + path + JSON.stringify(options || {});
  const cachedData =
    (memoryCache[cachedValueKey] as WithId<T>[]) ??
    extractCachedValue<T>(
      cachedValueKey,
      localStorage.getItem(cachedValueKey),
      expiry
    );
  if (!memoryCache[cachedValueKey] && cachedData) {
    memoryCache[cachedValueKey] = cachedData;
  }
  const uncachedCollection = useCollection<T>(cachedData ? null : path);

  const uncachedData = uncachedCollection.data?.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));

  if (uncachedData) {
    console.log('useCachedCollection: Using fresh data for ' + cachedValueKey);
    const dataToCache: CachedData<T> = {
      data: uncachedData,
      time: Date.now(),
    };
    localStorage.setItem(cachedValueKey, JSON.stringify(dataToCache));
  }

  return cachedData ?? uncachedData;
}

function extractCachedValue<T>(
  key: string,
  json: string | null,
  expiry: number
) {
  if (!json) {
    return undefined;
  }
  const cachedData = JSON.parse(json) as CachedData<T>;
  if (cachedData.time + expiry < Date.now()) {
    return undefined;
  }
  console.log('useCachedCollection: Using cached data for ' + key);
  return cachedData.data;
}
