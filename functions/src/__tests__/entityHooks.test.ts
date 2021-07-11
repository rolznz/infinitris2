import { setup } from './helpers/setup';
import './helpers/extensions';
import { IChallenge } from 'infinitris2-models';
import firebase from 'firebase';
import dummyData from './helpers/dummyData';
import { onUpdateEntity } from '../onUpdateEntity';

test('modified properties are updated when entity is updated without last modified date change', async () => {
  const { db, test } = await setup(
    undefined,
    {
      [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
    },
    false
  );

  await test.wrap(onUpdateEntity)(
    test.makeChange(
      test.firestore.makeDocumentSnapshot(
        dummyData.existingPublishedChallenge,
        dummyData.challenge1Path
      ),
      test.firestore.makeDocumentSnapshot(
        dummyData.existingPublishedChallenge,
        dummyData.challenge1Path
      )
    ),
    {
      auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }),
    }
  );

  const challenge = (
    await db.doc(dummyData.challenge1Path).get()
  ).data() as IChallenge;

  expect(challenge.readOnly.lastModifiedTimestamp?.seconds).toBeGreaterThan(
    firebase.firestore.Timestamp.now().seconds - 5
  );
  expect(challenge.readOnly.numTimesModified).toEqual(1);
});

test('modified properties are not updated recursively', async () => {
  const { db, test } = await setup(
    undefined,
    {
      [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
    },
    false
  );

  // the onUpdateEntity hook will run every time the entity is updated,
  // but should only update the last modified properties if diff does not contain a change to the last modified date
  await test.wrap(onUpdateEntity)(
    test.makeChange(
      test.firestore.makeDocumentSnapshot(
        {
          ...dummyData.existingPublishedChallenge,
          readOnly: {
            lastModifiedTimestamp: {
              seconds:
                dummyData.existingPublishedChallenge.readOnly
                  .lastModifiedTimestamp.seconds - 1,
              nanoseconds: 0,
            },
          },
        } as IChallenge,
        dummyData.challenge1Path
      ),
      test.firestore.makeDocumentSnapshot(
        dummyData.existingPublishedChallenge,
        dummyData.challenge1Path
      )
    ),
    {
      auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }),
    }
  );

  const challenge = (
    await db.doc(dummyData.challenge1Path).get()
  ).data() as IChallenge;

  // last modified date and num times modified should not have changed
  expect(challenge.readOnly.lastModifiedTimestamp?.seconds).toBeLessThan(
    firebase.firestore.Timestamp.now().seconds - 5
  );
  expect(challenge.readOnly.numTimesModified).toEqual(0);
});
