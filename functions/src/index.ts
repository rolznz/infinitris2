import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const app = admin.initializeApp();
const db = app.firestore();

// TODO: use typescript models from models project instead of document.get('magicKey')

/**
 * Updates the network impact
 * @param toUserId id of user who received the impact
 * @param fromUserId id of user who created the impact
 * @param distance how close the impact from fromUserId is to toUserId
 */
async function updateNetworkImpact(
  toUserId: string,
  fromUserId: string,
  distance: number = 1
) {
  console.log(
    'Update network impact',
    'from',
    fromUserId,
    'to',
    toUserId,
    'distance',
    distance
  );
  if (
    distance > 3 /* max recursions, TODO: review */ ||
    fromUserId === toUserId
  ) {
    return;
  }

  const impactRef = db.doc(
    `impactedUsers/${toUserId}/networkImpacts/${fromUserId}`
  );
  const impact = await impactRef.get();
  if (!impact.exists || impact.get('distance') > distance) {
    impactRef.set({
      distance,
      created: admin.firestore.Timestamp.now(),
    });

    // Recursively apply network impact
    // example:
    // user A creates a challenge
    // user B clones user A's challenge and modifies it
    // user C rates user B's challenge

    // to = B, from = C (distance = 1)
    // to = A, from = C (distance = 2)

    const parentImpacts = await db
      .collectionGroup('networkImpacts')
      .where('id', '==', toUserId)
      .get();

    for (const parentImpact of parentImpacts.docs) {
      updateNetworkImpact(parentImpact.id, fromUserId, distance + 1);
    }
  }
}

exports.onCreateUser = functions.firestore
  .document('users/{userId}')
  .onCreate((snapshot, _context) => {
    // give the user 3 credits
    // TODO: affiliate system reward
    return snapshot.ref.update({
      credits: 3,
      created: admin.firestore.Timestamp.now(),
    });
  });

exports.onCreateChallenge = functions.firestore
  .document('challenges/{challengeId}')
  .onCreate(async (snapshot, _context) => {
    const challenge = snapshot.data();
    // reduce the number of credits the user has so they
    // cannot create an infinite number of challenges
    const userDoc = db.doc(`users/${challenge.userId}`);
    await userDoc.update({
      credits: admin.firestore.FieldValue.increment(-1),
    });

    if (challenge.clonedFromUserId) {
      await updateNetworkImpact(challenge.clonedFromUserId, challenge.userId);
    }

    return snapshot.ref.update({
      created: admin.firestore.Timestamp.now(),
    });
  });

exports.onCreateRating = functions.firestore
  .document('ratings/{ratingId}')
  .onCreate(async (snapshot, _context) => {
    const rating = snapshot.data();
    if (rating.entityCollection === 'challenges') {
      const challengeDocRef = db.doc(`challenges/${snapshot.data().entityId}`);
      try {
        // update the challenge total rating
        // TODO: maybe could use increment on the two values rather than a transaction
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

        await (async () => {
          const challengeDoc = await challengeDocRef.get();
          const challenge = challengeDoc.data();
          if (challenge) {
            await updateNetworkImpact(challenge.userId, rating.userId);
          }
        })();
      } catch (e) {
        console.log('Failed to update challenge rating: ', e);
      }
    } else {
      throw new Error(
        'Unsupported entity collection: ' + rating.entityCollection
      );
    }
    return snapshot.ref.update({
      created: admin.firestore.Timestamp.now(),
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
            credits: admin.firestore.FieldValue.increment(1),
          });
        });
      });

    return null;
  });

exports.updateScoreboard = functions.pubsub
  .schedule('every 5 minutes')
  .onRun((_context) => {
    db.collection('users')
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (userDoc) {
          const challengeDocRef = db.doc(`scoreboardEntries/${userDoc.id}`);
          challengeDocRef.set({
            credits: userDoc.get('credits'),
            numCompletedChallenges: userDoc.get('completedChallengeIds').length,
            networkImpact: 0, // TODO: calculate
            numBlocksPlaced: 0, // TODO: number of blocks placed
          });
        });
      });

    return null;
  });
