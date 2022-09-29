import { setup } from './helpers/setup';
import './helpers/extensions';
import { IRoom } from 'infinitris2-models';
import dummyData from './helpers/dummyData';
import { onUpdateRoom } from '..';
import { postSimpleWebhook } from '../utils/postSimpleWebhook';

const simpleWebhookMock = postSimpleWebhook as jest.MockedFunction<
  typeof postSimpleWebhook
>;

test('number of players in room changed will fire simple webhook', async () => {
  const { test } = await setup(
    undefined,
    {
      [dummyData.room1Path]: dummyData.room1,
    },
    false
  );
  simpleWebhookMock.mockReset();

  await test.wrap(onUpdateRoom)(
    test.makeChange(
      test.firestore.makeDocumentSnapshot(dummyData.room1, dummyData.room1Path),
      test.firestore.makeDocumentSnapshot(
        {
          ...dummyData.room1,
          numHumans: dummyData.room1.numHumans + 1,
        } as IRoom,
        dummyData.room1Path
      )
    )
  );
  expect(simpleWebhookMock).toBeCalled();
});

test('number of players in room did not change will not fire simple webhook', async () => {
  const { test } = await setup(
    undefined,
    {
      [dummyData.room1Path]: dummyData.room1,
    },
    false
  );

  simpleWebhookMock.mockReset();
  await test.wrap(onUpdateRoom)(
    test.makeChange(
      test.firestore.makeDocumentSnapshot(dummyData.room1, dummyData.room1Path),
      test.firestore.makeDocumentSnapshot(dummyData.room1, dummyData.room1Path)
    )
  );
  expect(simpleWebhookMock).not.toBeCalled();
});
