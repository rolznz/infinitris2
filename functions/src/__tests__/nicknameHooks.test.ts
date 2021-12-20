import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { INickname, IUser, nicknamesPath } from 'infinitris2-models';
import dummyData from './helpers/dummyData';
import { onCreateNickname } from '../onCreateNickname';
import { firestore } from '@firebase/rules-unit-testing';

describe('Nickname Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('new nickname will be assigned to user', async () => {
    // assume the user already has a nickname
    const existingUser: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        nickname: dummyData.nicknameId2,
      },
    };

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: existingUser,
        [dummyData.nickname1Path]: dummyData.creatableNickname,
        [dummyData.nickname2Path]: dummyData.existingNickname,
      },
      false
    );

    await test.wrap(onCreateNickname)(
      test.firestore.makeDocumentSnapshot(
        dummyData.creatableNickname,
        dummyData.nickname1Path
      ),
      {
        params: {
          nicknameId: dummyData.nicknameId1,
        },
      }
    );

    const nickname = (
      await db.doc(dummyData.nickname1Path).get()
    ).data() as INickname;

    expect(nickname.userId).toBe(dummyData.userId1);
    expect(nickname.created).toBe(true);
    expect(nickname.readOnly!.createdTimestamp?.seconds).toBeGreaterThan(
      firestore.Timestamp.now().seconds - 5
    );

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    expect(user.readOnly.nickname).toEqual(dummyData.nicknameId1);

    // expect the user's old nickname to be freed
    const nicknames = await db.collection(nicknamesPath).get();
    expect(nicknames.docs.length).toBe(1);
    expect(nicknames.docs[0].id).toBe(dummyData.nicknameId1);
  });
});
