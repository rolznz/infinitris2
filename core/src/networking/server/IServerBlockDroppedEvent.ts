import IServerMessage from './IServerMessage';

export interface IServerBlockDroppedEvent extends IServerMessage {
  playerId: number;
}
