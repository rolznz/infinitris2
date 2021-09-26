import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';

let _app: admin.app.App;
let _db: firestore.Firestore;

export function getApp(): admin.app.App {
  if (!_app) {
    _app = admin.initializeApp();
  }
  return _app;
}

export function getDb(): firestore.Firestore {
  if (!_db) {
    const app = getApp();
    _db = app.firestore();
  }
  return _db;
}

export function getCurrentTimestamp(): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.now();
}

export function increment(n: number): number {
  return admin.firestore.FieldValue.increment(n) as any as number;
}
