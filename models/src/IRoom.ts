import { GameModeType } from '@models/GameModeType';
import { SimulationSettings } from '@models/SimulationSettings';
import { WorldType, WorldVariation } from '@models/WorldType';
import IEntity from './IEntity';

export default interface IRoom extends IEntity {
  name: string;
  serverId: string;
  roomIndex: number; // index within server
  numBots: number;
  numHumans: number;
  numSpectators: number;
  numPlayers: number;
  maxPlayers: number;
  worldType?: WorldType;
  worldVariation?: WorldVariation;
  simulationSettings?: SimulationSettings;
  gridNumRows?: number; // TODO: consider putting these in SimulationSettings
  gridNumColumns?: number;
}
