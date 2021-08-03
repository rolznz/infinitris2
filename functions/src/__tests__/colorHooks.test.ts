import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
import { IColor } from 'infinitris2-models';
import firebase from 'firebase';
import { onCreateColor } from '../onCreateColor';

describe('Color Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('color is automatically initialized', async () => {
    const { db, test } = await setup(
      undefined,
      {
        [dummyData.color1Path]: dummyData.creatableColor,
      },
      false
    );

    await test.wrap(onCreateColor)(
      test.firestore.makeDocumentSnapshot(
        dummyData.creatableColor,
        dummyData.color1Path
      ),
      {}
    );

    const color = (await db.doc(dummyData.color1Path).get()).data() as IColor;

    expect(color.created).toBe(true);
    expect(color.readOnly!.numPurchases).toBe(0);
    expect(color.readOnly!.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );
  });
});
