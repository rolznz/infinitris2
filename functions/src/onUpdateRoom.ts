import * as functions from 'firebase-functions';
import { IRoom } from 'infinitris2-models';
import { postSimpleWebhook } from './utils/postSimpleWebhook';

export const onUpdateRoom = functions.firestore
  .document('rooms/{roomId}')
  .onUpdate(
    async (
      change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
      context: functions.EventContext
    ) => {
      try {
        const beforeRoom = change.before.data() as IRoom;
        const afterRoom = change.after.data() as IRoom;
        if (afterRoom.numHumans !== beforeRoom.numHumans) {
          await postSimpleWebhook(
            'multiplayer',
            afterRoom.numHumans > 0
              ? `${afterRoom.numHumans} players in ${afterRoom.name}` +
                  '\n\n' +
                  `Join here: https://infinitris.net/rooms/${context.params.roomId}`
              : `${afterRoom.name} is now empty.`
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  );
