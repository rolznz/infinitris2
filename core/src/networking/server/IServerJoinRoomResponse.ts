import { NetworkBlockInfo } from '@models/IBlock';
import { NetworkGridInfo } from '@models/IGrid';
import { NetworkPlayerInfo } from '@models/IPlayer';
import { NetworkSimulationInfo } from '@models/ISimulation';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export enum JoinRoomResponseStatus {
  OK,
  FULL,
  WRONG_PASSWORD,
  NOT_READY,
  INCORRECT_VERSION,
}

type ServerJoinRoomResponseData =
  | {
      status: JoinRoomResponseStatus.OK;
      playerId: number;
      grid: NetworkGridInfo;
      players: NetworkPlayerInfo[];
      blocks: NetworkBlockInfo[];
      simulation: NetworkSimulationInfo;
      estimatedSpawnDelay: number;
    }
  | {
      status:
        | JoinRoomResponseStatus.NOT_READY
        | JoinRoomResponseStatus.FULL
        | JoinRoomResponseStatus.WRONG_PASSWORD
        | JoinRoomResponseStatus.INCORRECT_VERSION;
    };

export interface IServerJoinRoomResponse extends IServerMessage {
  data: ServerJoinRoomResponseData;
}
