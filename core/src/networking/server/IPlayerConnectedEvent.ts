import IServerMessage from './IServerMessage';

export default interface IPlayerConnectedEvent extends IServerMessage {
  playerId: number;
}
