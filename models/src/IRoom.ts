import { WorldType } from '@models/WorldType';
import IEntity from './IEntity';

export default interface IRoom extends IEntity {
  name: string;
  serverId: string;
  //gameMode: string;
  numPlayers: number;
  maxPlayers: number;
  roomIndex: number; // index within server
  worldType?: WorldType;
}
