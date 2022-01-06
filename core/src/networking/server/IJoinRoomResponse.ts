import { NetworkBlockInfo } from '@models/IBlock';
import { NetworkGridInfo } from '@models/IGrid';
import { NetworkPlayerInfo } from '@models/IPlayer';
import IServerMessage from './IServerMessage';

export enum JoinRoomResponseStatus {
  OK,
  FULL,
  WRONG_PASSWORD,
}

type JoinRoomResponseData =
  | {
      status: JoinRoomResponseStatus.OK;
      playerId: number;
      grid: NetworkGridInfo;
      players: NetworkPlayerInfo[];
      blocks: NetworkBlockInfo[];
    }
  | {
      status:
        | JoinRoomResponseStatus.FULL
        | JoinRoomResponseStatus.WRONG_PASSWORD;
    };

export interface IJoinRoomResponse extends IServerMessage {
  data: JoinRoomResponseData;
}
