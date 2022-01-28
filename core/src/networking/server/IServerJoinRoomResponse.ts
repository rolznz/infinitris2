import { NetworkBlockInfo } from '@models/IBlock';
import { NetworkGridInfo } from '@models/IGrid';
import { NetworkPlayerInfo } from '@models/IPlayer';
import { NetworkSimulationInfo } from '@models/ISimulation';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export enum JoinRoomResponseStatus {
  OK,
  FULL,
  WRONG_PASSWORD,
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
        | JoinRoomResponseStatus.FULL
        | JoinRoomResponseStatus.WRONG_PASSWORD;
    };

export interface IServerJoinRoomResponse extends IServerMessage {
  data: ServerJoinRoomResponseData;
}
