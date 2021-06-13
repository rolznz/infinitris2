import { INetworkImpact, IUser } from 'infinitris2-models';
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
  if (fromUserId === toUserId) {
    return;
  }
  console.log(
    'Checking network impact',
    'from',
    fromUserId,
    'to',
    toUserId,
    'distance',
    distance
  );
  if (distance > 5 /* max recursions, TODO: review */) {
    console.log('Hit max network impact recursions', distance);
    return;
  }

  const impactRef = db.doc(
    `impactedUsers/${toUserId}/networkImpacts/${fromUserId}`
  );
  const impactDoc = await impactRef.get();
  if (
    !impactDoc.exists ||
    (impactDoc.data() as INetworkImpact).distance > distance
  ) {
    if (!impactDoc.exists) {
      // award user 1 credit, update realized network impact
      const userDocRef = db.doc(`users/${toUserId}`);
      await userDocRef.update({
        credits: (admin.firestore.FieldValue.increment(1) as any) as number,
        networkImpact: (admin.firestore.FieldValue.increment(
          1
        ) as any) as number,
      } as Pick<IUser, 'credits' | 'networkImpact'>);
    }

    await impactRef.set({
      toUserId, // part of the URL, but store for convenience, see https://stackoverflow.com/a/58491352/4562693
      fromUserId, // part of the URL, but store for convenience, see https://stackoverflow.com/a/58491352/4562693
      distance,
      createdTimestamp: admin.firestore.Timestamp.now(),
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
      .where('fromUserId', '==', toUserId)
      .get();

    console.log('Found parent impacts:', parentImpacts.docs.length);

    for (const parentImpactDoc of parentImpacts.docs) {
      const parentImpact = parentImpactDoc.data() as INetworkImpact;
      await updateNetworkImpact(
        parentImpact.toUserId,
        fromUserId,
        distance + 1
      );
    }
  } else {
    console.log(
      'Network impact up to date:',
      'from',
      fromUserId,
      'to',
      toUserId,
      'distance',
      distance
    );
  }
}
