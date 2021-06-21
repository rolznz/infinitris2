// stop firebase-functions error message when we are using the emulator
// Warning, FIREBASE_CONFIG and GCLOUD_PROJECT environment variables are missing. Initializing firebase-admin will fail
process.env.FIREBASE_CONFIG = 'FAKE';
process.env.GCLOUD_PROJECT = 'FAKE';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

import {
  initializeTestApp,
  loadFirestoreRules,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import firebase from 'firebase';
import * as fft from 'firebase-functions-test';

import * as firebaseUtils from '../../utils/firebase';
import { FeaturesList } from 'firebase-functions-test/lib/features';
import { firestore } from 'firebase-admin';
jest.mock('../../utils/firebase');

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

let app: firebase.app.App;
let test: FeaturesList;

export async function setup(
  auth?: TestAuth,
  data?: TestData,
  applySecurityRules = true
): Promise<{ db: firebase.firestore.Firestore; test: FeaturesList }> {
  // Create a unique projectId for every firebase simulated app
  const projectId = `rules-spec-${Date.now()}`;

  test = fft({
    projectId,
  });

  // Create the test app using the unique ID and the given user auth object
  app = await initializeTestApp({
    projectId,
    auth,
  });

  // Get the db linked to the new firebase app that we created
  const db = app.firestore();

  // FIXME: Google typings are incompatible (firebase.app.App vs admin.app.App)
  mockedApp.mockReturnValue((app as any) as admin.app.App);
  // FIXME: Google typings are incompatible
  // (@firebase/rules-unit-testing.firestore.Firestore vs firebase-admin/firestore.Firestore)
  mockedDb.mockReturnValue((db as any) as firestore.Firestore);

  // Apply the test rules so we can write documents
  await loadFirestoreRules({
    projectId,
    rules: fs.readFileSync('./src/__tests__/firestore-test.rules', 'utf8'),
  });

  // Write mock documents with test rules
  if (data) {
    for (const key of Object.keys(data)) {
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

export async function teardown() {
  await Promise.all([app.delete(), test.cleanup()]);
}
