import IServerMessage from './IServerMessage';

export interface IServerNextSpawnEvent extends IServerMessage {
  time: number;
}
