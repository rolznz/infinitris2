import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const app = admin.initializeApp();
const db = app.firestore();

exports.onCreateUser = functions.firestore
  .document('users/{userId}')
  .onCreate((change, _context) => {
    // give the user 3 credits
    return change.ref.update({
      credits: 3,
    });
  });

exports.onCreateChallenge = functions.firestore
  .document('challenges/{challengeId}')
  .onCreate(async (snapshot, _context) => {
    const userDoc = db.doc(`users/${snapshot.data().userId}`);
    const userDocData = await userDoc.get();
    // reduce the number of credits the user has so they
    // cannot create an infinite number of challenges
    return userDoc.update({
      credits: userDocData.get('credits') - 1,
    });
  });

exports.dailyCreditAward = functions.pubsub
  .schedule('every 24 hours')
  .onRun((_context) => {
    db.collection('users')
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          doc.ref.update({
            credits: doc.get('credits') + 1,
          });
        });
      });

    return null;
  });
