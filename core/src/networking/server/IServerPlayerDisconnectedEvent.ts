import IServerMessage from './IServerMessage';

export default interface IServerPlayerDisconnectedEvent extends IServerMessage {
  playerId: number;
}
