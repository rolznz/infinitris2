import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import { IEntity, objectToDotNotation } from 'infinitris2-models';
import { convertTimestampMapToObject, getDb } from '../../utils/firebase';

export const fixTimestampsWebhook = async (req: Request, res: Response) => {
  try {
    const key = functions.config().webhooks.key;

    if (req.query['key'] !== key) {
      res.status(StatusCodes.UNAUTHORIZED);
      return res.send();
    }

    const collectionPath = req.query['path'] as string;
    if (!collectionPath) {
      throw new Error('No collection path provided');
    }
    const entities = await getDb()
      .collection(collectionPath)
      .orderBy('readOnly.createdTimestamp._seconds') // only docs with _seconds will be retrieved
      .get();

    console.log('Found ' + entities.docs.length + ' entities to fix');

    let entitiesUpdated = 0;
    const startTime = Date.now();
    for (const doc of entities.docs) {
      const entity = doc.data() as IEntity;

      if (
        entity.readOnly?.createdTimestamp &&
        !(entity.readOnly.createdTimestamp as unknown as { toDate: Function })
          .toDate
      ) {
        console.log(doc.id + ' fixing');

        const updateEntity = objectToDotNotation<IEntity>(
          {
            readOnly: {
              createdTimestamp: convertTimestampMapToObject(
                entity.readOnly.createdTimestamp as unknown as {
                  _seconds: number;
                  _nanoseconds: number;
                }
              ),
            },
          },
          ['readOnly.createdTimestamp']
        );
        await doc.ref.update(updateEntity);

        console.log(entitiesUpdated);
        ++entitiesUpdated;
        if (Date.now() - startTime > 50000) {
          break;
        }
      } else {
        console.log(doc.id + ' ok');
      }
    }

    return res.json({ challengeAttemptsUpdated: entitiesUpdated });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
