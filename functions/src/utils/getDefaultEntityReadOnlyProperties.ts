import * as admin from 'firebase-admin';
import { IEntityReadOnlyProperties, Timestamp } from 'infinitris2-models';

export function getDefaultEntityReadOnlyProperties(timestamp?: Timestamp) {
  const properties: IEntityReadOnlyProperties = {
    createdTimestamp: timestamp || admin.firestore.Timestamp.now(),
    lastModifiedTimestamp: timestamp || admin.firestore.Timestamp.now(),
    numTimesModified: 0,
  };
  return properties;
}
