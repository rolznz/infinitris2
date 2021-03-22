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
    // reduce the number of credits the user has so they
    // cannot create an infinite number of challenges
    const userDoc = db.doc(`users/${snapshot.data().userId}`);
    const userDocData = await userDoc.get();
    await userDoc.update({
      credits: userDocData.get('credits') - 1,
    });
  });

exports.onCreateRating = functions.firestore
  .document('ratings/{ratingId}')
  .onCreate(async (snapshot, _context) => {
    const rating = snapshot.data();
    if (rating.entityType === 'challenge') {
      // update the challenge total rating
      const challengeDocRef = db.doc(`challenges/${snapshot.data().entityId}`);
      try {
        await db.runTransaction(async (t) => {
          const challengeDoc = await t.get(challengeDocRef);
          const challenge = challengeDoc.data();
          if (challenge) {
            const oldNumRatings = challenge.numRatings || 0;
            const oldTotalRating = challenge.totalRating || 0;
            const numRatings = oldNumRatings + 1;
            const totalRating =
              oldTotalRating * (oldNumRatings / numRatings) +
              rating.value * (1 / numRatings);
            t.update(challengeDocRef, { numRatings, totalRating });
          }
        });

        console.log('Updated challenge rating: ', rating.entityId);
      } catch (e) {
        console.log('Failed to update challenge rating: ', e);
      }
    } else {
      throw new Error('Unsupported entity type: ' + rating.entityType);
    }
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
