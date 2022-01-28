import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerNextSpawnEvent extends IServerMessage {
  time: number;
}
