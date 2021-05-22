import * as firebase from '@firebase/testing';
import * as fs from 'fs';

interface TestAuth {
  uid: string;
}

type TestData = { [path: string]: firebase.firestore.DocumentData };

export async function setup(auth?: TestAuth, data?: TestData) {
  // Create a unique projectId for every firebase simulated app
  const projectId = `rules-spec-${Date.now()}`;

  // Create the test app using the unique ID and the given user auth object
  const app = await firebase.initializeTestApp({
    projectId,
    auth,
  });

  // Get the db linked to the new firebase app that we creted
  const db = app.firestore();

  // Apply the test rules so we can write documents
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync('./src/__tests__/firestore-test.rules', 'utf8'),
  });

  // Write mock documents with test rules
  if (data) {
    for (const key in data) {
      const ref = db.doc(key);
      await ref.set(data[key]);
    }
  }

  // Apply the rules that we have locally in the project file
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync('../firestore.rules', 'utf8'),
  });

  // return the initialised DB for testing
  return db;
}

export function teardown() {
  // Delete all apps currently running in the firebase simulated environment
  return firebase.apps().map((app) => app.delete());
}
