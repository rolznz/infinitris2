import IEntity from './IEntity';

export default interface IRoom extends IEntity {
  name: string;
  serverId: string;
  //gameMode: string;
  numPlayers: number;
  maxPlayers: number;
  roomId: number;
}
