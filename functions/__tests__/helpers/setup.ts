// stop firebase-functions error message when we are using the emulator
// "Warning, FIREBASE_CONFIG and GCLOUD_PROJECT environment variables are missing. Initializing firebase-admin will fail"
process.env.FIREBASE_CONFIG = 'FAKE';
process.env.GCLOUD_PROJECT = 'FAKE';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

import {
  initializeTestApp,
  loadFirestoreRules,
  apps,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import { Timestamp } from 'infinitris2-models';
import firebase from 'firebase';
import * as fft from 'firebase-functions-test';

import * as firebaseUtils from '../../src/utils/firebase';
import { FeaturesList } from 'firebase-functions-test/lib/features';
jest.mock('../../src/utils/firebase');

const mockedApp = firebaseUtils.getApp as jest.MockedFunction<
  typeof firebaseUtils.getApp
>;
const mockedDb = firebaseUtils.getDb as jest.MockedFunction<
  typeof firebaseUtils.getDb
>;

interface TestAuth {
  uid: string;
}

type TestData = { [path: string]: firebase.firestore.DocumentData };

export const createdTimestamp: Timestamp = {
  seconds: 1622246405,
  nanoseconds: 0,
};

export async function setup(
  auth?: TestAuth,
  data?: TestData,
  applySecurityRules = true
): Promise<{ db: firebase.firestore.Firestore; test: FeaturesList }> {
  // Create a unique projectId for every firebase simulated app
  const projectId = `rules-spec-${Date.now()}`;

  const test = fft({
    projectId,
  });

  // Create the test app using the unique ID and the given user auth object
  const app = await initializeTestApp({
    projectId,
    auth,
  });

  // Get the db linked to the new firebase app that we created
  const db = app.firestore();

  // FIXME: Google typings are incompatible (firebase.app.App vs admin.app.App)
  mockedApp.mockReturnValue((app as any) as admin.app.App);
  // FIXME: Google typings are incompatible (@firebase/rules-unit-testing.firestore.Firestore vs FirebaseFirestore.Firestore)
  mockedDb.mockReturnValue((db as any) as FirebaseFirestore.Firestore);

  // Apply the test rules so we can write documents
  await loadFirestoreRules({
    projectId,
    rules: fs.readFileSync('./__tests__/firestore-test.rules', 'utf8'),
  });

  // Write mock documents with test rules
  if (data) {
    for (const key in data) {
      const ref = db.doc(key);
      await ref.set(data[key]);
    }
  }

  if (applySecurityRules) {
    // Apply the rules that we have locally in the project file
    await loadFirestoreRules({
      projectId,
      rules: fs.readFileSync('../firestore.rules', 'utf8'),
    });
  }

  // return the initialised DB for testing
  return { db, test };
}

export function teardown() {
  // Delete all apps currently running in the firebase simulated environment
  return apps().map((app) => app.delete());
}
