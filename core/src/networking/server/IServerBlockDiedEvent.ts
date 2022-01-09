import IServerMessage from './IServerMessage';

export interface IServerBlockDiedEvent extends IServerMessage {
  playerId: number;
}
