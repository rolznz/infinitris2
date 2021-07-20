import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { INickname, IUser } from 'infinitris2-models';
import firebase from 'firebase';
import dummyData from './helpers/dummyData';
import { onCreateNickname } from '../onCreateNickname';

describe('Nickname Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('new nickname will be assigned to user', async () => {
    const { db, test } = await setup(
      undefined,
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.nickname1Path]: dummyData.nickname1,
      },
      false
    );

    await test.wrap(onCreateNickname)(
      test.firestore.makeDocumentSnapshot(
        dummyData.nickname1,
        dummyData.nickname1Path
      ),
      {
        auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }),
        params: {
          nicknameId: dummyData.nicknameId1,
        },
      }
    );

    const nickname = (
      await db.doc(dummyData.nickname1Path).get()
    ).data() as INickname;

    expect(nickname.readOnly!.userId).toBe(dummyData.userId1);
    expect(nickname.created).toBe(true);
    expect(nickname.readOnly!.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    expect(user.readOnly.nickname).toEqual(dummyData.nicknameId1);
  });

  // TODO: user can only hold one nickname
});
