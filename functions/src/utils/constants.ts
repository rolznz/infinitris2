import * as admin from 'firebase-admin';
export const app = admin.initializeApp();
export const db = app.firestore();
