import { GameModeType } from '@models/GameModeType';
import { WorldType, WorldVariation } from '@models/WorldType';
import IEntity from './IEntity';

export default interface IRoom extends IEntity {
  name: string;
  serverId: string;
  roomIndex: number; // index within server
  gameModeType: GameModeType;
  numBots: number;
  numHumans: number;
  numSpectators: number;
  numPlayers: number;
  maxPlayers: number;
  worldType?: WorldType;
  worldVariation?: WorldVariation;
}
