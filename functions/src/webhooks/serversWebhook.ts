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

export const serversWebhook = async (req: Request, res: Response) => {
  try {
    const body: UpdateServerRequest = req.body;
    const serverId = req.params.serverId;

    if (
      !serverId ||
      !body.serverKey ||
      body.rooms?.some((room) => room.serverId !== serverId)
    ) {
      res.status(StatusCodes.BAD_REQUEST);
      res.end();
      return;
    }

    const serverKeyDoc = getDb().doc(getServerKeyPath(body.serverKey));

    const serverKey = await serverKeyDoc.get();
    if (!serverKey.exists) {
      res.status(StatusCodes.NOT_FOUND);
      res.end();
      return;
    }

    const serverKeyData = serverKey.data() as IServerKey;
    if (serverId !== serverKeyData.serverId) {
      res.status(StatusCodes.UNAUTHORIZED);
      res.end();
      return;
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
    res.status(204);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500);
    res.end();
  }
};
