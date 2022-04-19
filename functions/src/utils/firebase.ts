import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';

let _app: admin.app.App;
let _db: firestore.Firestore;

export const systemUserId = 'SYSTEM';

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

export function createFirebaseUser(
  email: string
): Promise<admin.auth.UserRecord> {
  try {
    return admin.auth().createUser({
      email,
    });
  } catch (error) {
    console.error('Failed to create user for email', email);
    throw error;
  }
}

export async function createCustomLoginToken(email: string): Promise<string> {
  try {
    const { uid } = await getUserByEmail(email);

    return admin.auth().createCustomToken(uid);
  } catch (error) {
    console.error('Failed to create custom login token for email', email);
    throw error;
  }
}

export function getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
  return admin.auth().getUserByEmail(email);
}
