import { setup } from './helpers/setup';
import './helpers/extensions';
import { IChallenge, IUser } from 'infinitris2-models';
import dummyData from './helpers/dummyData';
import { onUpdateEntity } from '../onUpdateEntity';
import { RATE_LIMIT_USER_WRITE_RATE_CHANGE } from '../utils/updateUserRateLimit';
import { onCreateEntity } from '../onCreateEntity';
import { firestore } from '@firebase/rules-unit-testing';

test('modified properties are updated when entity is updated without last modified date change', async () => {
  const { db, test } = await setup(
    undefined,
    {
      [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      [dummyData.user1Path]: dummyData.existingUser,
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

  expect(challenge.readOnly?.lastModifiedTimestamp.seconds).toBeGreaterThan(
    firestore.Timestamp.now().seconds - 5
  );
  expect(challenge.readOnly?.numTimesModified).toEqual(1);
});

test('modified properties are not updated recursively', async () => {
  const { db, test } = await setup(
    undefined,
    {
      [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      [dummyData.user1Path]: dummyData.existingUser,
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
                dummyData.existingPublishedChallenge.readOnly!
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
  expect(challenge.readOnly?.lastModifiedTimestamp?.seconds).toBeLessThan(
    firestore.Timestamp.now().seconds - 5
  );
  expect(challenge.readOnly?.numTimesModified).toEqual(0);
});

test('rate limit updated when user creates an entity', async () => {
  const prevTimestamp = firestore.Timestamp.now();
  const existingUser: IUser = {
    ...dummyData.existingUser,
    readOnly: {
      ...dummyData.existingUser.readOnly,
      lastWriteTimestamp: prevTimestamp,
    },
  };

  const { db, test } = await setup(
    undefined,
    {
      [dummyData.challenge1Path]: dummyData.creatableChallenge,
      [dummyData.user1Path]: existingUser,
    },
    false
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await test.wrap(onCreateEntity)(
    test.firestore.makeDocumentSnapshot(
      dummyData.creatableChallenge,
      dummyData.challenge1Path
    ),
    {
      auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }),
    }
  );

  const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;

  expect(user.readOnly.numWrites).toBe(1);
  expect(user.readOnly.lastWriteTimestamp.seconds).toBeGreaterThan(
    prevTimestamp.seconds
  );
  // expect rate limit to increase because time since last write < RATE_LIMIT_MAX_SECONDS
  expect(user.readOnly.writeRate).toBe(RATE_LIMIT_USER_WRITE_RATE_CHANGE);
});

test('rate limit updated when user updates an entity', async () => {
  const prevTimestamp = firestore.Timestamp.now();
  const existingUser: IUser = {
    ...dummyData.existingUser,
    readOnly: {
      ...dummyData.existingUser.readOnly,
      lastWriteTimestamp: prevTimestamp,
    },
  };

  const { db, test } = await setup(
    undefined,
    {
      [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      [dummyData.user1Path]: existingUser,
    },
    false
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

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

  const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;

  expect(user.readOnly.numWrites).toBe(1);
  expect(user.readOnly.lastWriteTimestamp.seconds).toBeGreaterThan(
    prevTimestamp.seconds
  );
  // expect rate limit to increase because time since last write < RATE_LIMIT_MAX_SECONDS
  expect(user.readOnly.writeRate).toBe(RATE_LIMIT_USER_WRITE_RATE_CHANGE);
});
