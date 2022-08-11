import * as functions from 'firebase-functions';
import {
  challengeAttemptsPath,
  getChallengePath,
  getUserPath,
  IChallenge,
  IChallengeAttempt,
  IUser,
  objectToDotNotation,
  removeUndefinedValues,
  verifyProperty,
} from 'infinitris2-models';
import { FirestoreDocRef, getDb, increment } from './utils/firebase';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';
import { postSimpleWebhook } from './utils/postSimpleWebhook';

export const onCreateChallengeAttempt = functions.firestore
  .document('challengeAttempts/{challengeAttemptId}')
  .onCreate(async (snapshot) => {
    try {
      const challengeAttempt = snapshot.data() as IChallengeAttempt;
      const userId = challengeAttempt.userId;
      if (!userId) {
        throw new Error('User not logged in');
      }
      const challengeRef = getDb().doc(
        getChallengePath(challengeAttempt.challengeId)
      );

      const updateChallenge = objectToDotNotation<IChallenge>(
        {
          readOnly: {
            numAttempts: increment(1),
          },
        },
        ['readOnly.numAttempts']
      );
      await challengeRef.update(updateChallenge);

      const userDocRef = getDb().doc(getUserPath(userId));
      const userDoc = await userDocRef.get();
      const user = userDoc.data() as IUser;

      await getDb()
        .doc(snapshot.ref.path)
        .update(
          removeUndefinedValues({
            readOnly: {
              ...getDefaultEntityReadOnlyProperties(),
              userId,
              user: {
                nickname: user.readOnly?.nickname,
                selectedCharacterId: user.selectedCharacterId,
              },
            },
            created: true,
          } as Pick<IChallengeAttempt, 'readOnly' | 'created'>)
        );

      await updatePlayerTopChallengeAttempt(challengeAttempt, snapshot.ref);
      await updateChallengeTopAttempts(
        challengeAttempt.challengeId,
        challengeRef
      );
      await announceTopAttempt(
        snapshot.id,
        challengeAttempt,
        userId,
        user,
        challengeRef
      );
    } catch (error) {
      console.error(error);
    }
  });

async function announceTopAttempt(
  challengeAttemptId: string,
  challengeAttempt: IChallengeAttempt,
  userId: string,
  user: IUser,
  challengeRef: FirestoreDocRef
) {
  const topAttempts = await getDb()
    .collection(challengeAttemptsPath)
    .where(
      verifyProperty<IChallengeAttempt>('challengeId'),
      '==',
      challengeAttempt.challengeId
    )
    .orderBy(verifyProperty<IChallengeAttempt>('stats.timeTakenMs'))
    .limit(2)
    .get();
  if (
    topAttempts.docs.length < 2 ||
    (topAttempts.docs[0].id === challengeAttemptId &&
      (topAttempts.docs[1].data() as IChallengeAttempt).userId !== userId)
  ) {
    const challengeDoc = await challengeRef.get();
    const challengeData = challengeDoc.data() as IChallenge;
    postSimpleWebhook(
      `${user.readOnly.nickname || 'Unknown user'} took first place on ${
        challengeData.title || 'Unnamed challenge'
      } with a time of ${(challengeAttempt.stats.timeTakenMs / 1000).toFixed(
        2
      )}s\n\nView their replay or try for a faster time: https://infinitris.net/challenges/${
        challengeAttempt.challengeId
      }`
    );
  }
}

async function updatePlayerTopChallengeAttempt(
  challengeAttempt: IChallengeAttempt,
  challengeAttemptRef: FirestoreDocRef
) {
  const playerTopAttempts = await getDb()
    .collection(challengeAttemptsPath)
    .where(
      verifyProperty<IChallengeAttempt>('challengeId'),
      '==',
      challengeAttempt.challengeId
    )
    .where(
      verifyProperty<IChallengeAttempt>('userId'),
      '==',
      challengeAttempt.userId
    )
    .where(
      verifyProperty<IChallengeAttempt>('readOnly.isPlayerTopAttempt'),
      '==',
      true
    )
    .get();

  if (
    !playerTopAttempts.docs.length ||
    !playerTopAttempts.docs.some(
      (doc) =>
        (doc.data() as IChallengeAttempt).stats.timeTakenMs <
        challengeAttempt.stats.timeTakenMs
    )
  ) {
    for (const oldTopAttemptDoc of playerTopAttempts.docs) {
      await updateChallengeAttemptIsTopPlayerAttempt(
        oldTopAttemptDoc.ref,
        false
      );
    }
    await updateChallengeAttemptIsTopPlayerAttempt(challengeAttemptRef, true);
  }
}

async function updateChallengeTopAttempts(
  challengeId: string,
  challengeRef: FirestoreDocRef
) {
  const topAttempts = await getDb()
    .collection(challengeAttemptsPath)
    .where(verifyProperty<IChallengeAttempt>('challengeId'), '==', challengeId)
    .where(
      verifyProperty<IChallengeAttempt>('readOnly.isPlayerTopAttempt'),
      '==',
      true
    )
    .orderBy(verifyProperty<IChallengeAttempt>('stats.timeTakenMs'))
    .limit(3)
    .get();

  const updateChallenge = objectToDotNotation<IChallenge>(
    {
      readOnly: {
        topAttempts: topAttempts.docs.map((doc) => ({
          ...(doc.data() as IChallengeAttempt),
          id: doc.id,
        })),
      },
    },
    ['readOnly.topAttempts']
  );

  await challengeRef.update(updateChallenge);
}

const updateChallengeAttemptIsTopPlayerAttempt = async (
  ref: FirestoreDocRef,
  isPlayerTopAttempt: boolean
) => {
  const updateChallengeAttemptData = objectToDotNotation<IChallengeAttempt>(
    {
      readOnly: {
        isPlayerTopAttempt,
      },
    },
    ['readOnly.isPlayerTopAttempt']
  );

  await ref.update(updateChallengeAttemptData);
};
