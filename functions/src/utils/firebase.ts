import * as admin from 'firebase-admin';
import { FirebaseError, firestore } from 'firebase-admin';

let _app: admin.app.App;
let _db: firestore.Firestore;

export const systemUserId = 'SYSTEM';

export type FirestoreDocRef<T = firestore.DocumentData> =
  firestore.DocumentReference<T>;

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

export function convertTimestampMapToObject({
  _seconds,
  _nanoseconds,
}: {
  _seconds: number;
  _nanoseconds: number;
}): admin.firestore.Timestamp {
  return new admin.firestore.Timestamp(_seconds, _nanoseconds);
}

export function increment(n: number): number {
  return admin.firestore.FieldValue.increment(n) as any as number;
}

export function createFirebaseUser(
  email: string
): Promise<admin.auth.UserRecord> {
  try {
    const result = admin.auth().createUser({
      email,
    });
    console.log('Created user for email: ' + email);
    return result;
  } catch (error) {
    console.error('Failed to create user for email', email);
    throw error;
  }
}

export async function createCustomLoginToken(email: string): Promise<string> {
  try {
    const { uid } = (await getUserByEmail(email))!;

    return admin.auth().createCustomToken(uid);
  } catch (error) {
    console.error('Failed to create custom login token for email', email);
    throw error;
  }
}

export async function getUserByEmail(
  email: string
): Promise<admin.auth.UserRecord | null> {
  try {
    const result = await admin.auth().getUserByEmail(email);
    return result;
  } catch (error) {
    if ((error as FirebaseError).code === 'auth/user-not-found') {
      return Promise.resolve(null);
    } else {
      throw error;
    }
  }
}
