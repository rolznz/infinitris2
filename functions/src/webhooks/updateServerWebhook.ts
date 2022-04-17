import { getDb } from '../utils/firebase';
import {
  getServerKeyPath,
  getServerPath,
  getServerRoomPath,
  IServerKey,
  UpdateServerRequest,
} from 'infinitris2-models';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const updateServerWebhook = async (req: Request, res: Response) => {
  try {
    const body: UpdateServerRequest = req.body;
    const serverId = req.params.serverId;

    if (
      !serverId ||
      !body.serverKey ||
      body.rooms?.some((room) => room.serverId !== serverId)
    ) {
      res.status(StatusCodes.BAD_REQUEST);
      return res.send();
    }

    const serverKeyDoc = getDb().doc(getServerKeyPath(body.serverKey));

    const serverKey = await serverKeyDoc.get();
    if (!serverKey.exists) {
      res.status(StatusCodes.NOT_FOUND);
      return res.send();
    }

    const serverKeyData = serverKey.data() as IServerKey;
    if (serverId !== serverKeyData.serverId) {
      res.status(StatusCodes.UNAUTHORIZED);
      return res.send();
    }

    const serverDoc = getDb().doc(getServerPath(serverId));

    if (body.server) {
      // TODO: limit fields
      await serverDoc.set(body.server, { merge: true });
    }

    if (body.rooms) {
      for (const roomToUpdate of body.rooms) {
        const roomDoc = getDb().doc(
          getServerRoomPath(serverId, roomToUpdate.roomIndex)
        );

        // TODO: limit fields
        await roomDoc.set(roomToUpdate, { merge: true });
      }
    }
    res.status(StatusCodes.NO_CONTENT);
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
