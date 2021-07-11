import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { challengesPath } from 'infinitris2-models';
import dummyData from './helpers/dummyData';

describe('Entity Queries', () => {
  afterEach(async () => {
    await teardown();
  });

  test('filter challenges by created status', async () => {
    const { db } = await setup(
      undefined,
      {
        [dummyData.challenge1Path]: dummyData.creatableChallenge,
        [dummyData.challenge2Path]: dummyData.existingPublishedChallenge,
      },
      false
    );

    expect(
      (await db.collection(challengesPath).where('created', '==', true).get())
        .docs.length
    ).toEqual(1);
    expect(
      (await db.collection(challengesPath).where('created', '==', false).get())
        .docs.length
    ).toEqual(1);
  });
});
