import firebase from 'firebase';
import {
  getNetworkImpactPath,
  getUserPath,
  INetworkImpact,
  networkImpactsPath,
} from 'infinitris2-models';
import { getDb } from './firebase';
import IUpdateUserReadOnly from '../models/IUpdateUserReadOnly';

/**
 * Updates the network impact
 * @param toUserId id of user who received the impact
 * @param fromUserId id of user who created the impact
 * @param distance how close the impact from fromUserId is to toUserId
 */
export default async function updateNetworkImpact(
  toUserId: string,
  fromUserId: string,
  distance: number = 1
) {
  /* console.log(
    'Checking network impact',
    'from',
    fromUserId,
    'to',
    toUserId,
    'distance',
    distance
  );*/
  if (fromUserId === toUserId) {
    throw new Error(
      'Cannot create network impact to the same user: ' + fromUserId
    );
  }

  if (distance > 5 /* max recursions, TODO: review */) {
    console.warn('Hit max network impact recursions', distance);
    return;
  }

  const impactRef = getDb().doc(getNetworkImpactPath(toUserId, fromUserId));
  const impactDoc = await impactRef.get();
  if (
    !impactDoc.exists ||
    (impactDoc.data() as INetworkImpact).distance > distance
  ) {
    if (!impactDoc.exists) {
      // award user 1 credit, update realized network impact
      const updateUserRequest: IUpdateUserReadOnly = {
        'readOnly.credits': firebase.firestore.FieldValue.increment(1),
        'readOnly.networkImpact': firebase.firestore.FieldValue.increment(1),
      };
      const userDocRef = getDb().doc(getUserPath(toUserId));
      await userDocRef.update(updateUserRequest);
    }

    const networkImpact: INetworkImpact = {
      toUserId, // part of the URL, but store for convenience, see https://stackoverflow.com/a/58491352/4562693
      fromUserId, // part of the URL, but store for convenience, see https://stackoverflow.com/a/58491352/4562693
      distance,
      readOnly: {
        createdTimestamp: firebase.firestore.Timestamp.now(),
      },
    };

    await impactRef.set(networkImpact);

    // Recursively apply network impact
    // example:
    // user A creates a challenge
    // user B rates user A's challenge
    // user C signs up using user B's affiliate link

    // to = B, from = C (distance = 1)
    // to = A, from = C (distance = 2)

    const parentImpacts = await getDb()
      .collectionGroup(networkImpactsPath)
      .where('fromUserId', '==', toUserId)
      .get();

    // console.log('Found parent impacts:', parentImpacts.docs.length);

    for (const parentImpactDoc of parentImpacts.docs) {
      const parentImpact = parentImpactDoc.data() as INetworkImpact;
      await updateNetworkImpact(
        parentImpact.toUserId,
        fromUserId,
        distance + 1
      );
    }
  } else {
    /* console.log(
      'Network impact up to date:',
      'from',
      fromUserId,
      'to',
      toUserId,
      'distance',
      distance
    );*/
  }
}
