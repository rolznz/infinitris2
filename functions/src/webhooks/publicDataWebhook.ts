import { getDb } from '../utils/firebase';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { charactersPath } from 'infinitris2-models';

export const publicDataWebhook = async (req: Request, res: Response) => {
  try {
    const collectionId = req.params.collectionId;

    if ([charactersPath].indexOf(collectionId) < 0) {
      res.status(StatusCodes.BAD_REQUEST);
      return res.send();
    }

    const collection = getDb().collection(collectionId);
    return res.json(
      (await collection.get()).docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
