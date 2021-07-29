import { IEntityReadOnlyProperties } from 'infinitris2-models';
import { getCurrentTimestamp } from './firebase';

export function getDefaultEntityReadOnlyProperties() {
  const timestamp = getCurrentTimestamp();
  const properties: IEntityReadOnlyProperties = {
    createdTimestamp: timestamp,
    lastModifiedTimestamp: timestamp,
    numTimesModified: 0,
  };
  return properties;
}
