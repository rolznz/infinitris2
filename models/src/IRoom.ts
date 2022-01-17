import IEntity from './IEntity';

export default interface IRoom extends IEntity {
  id: string;
  name: string;
  mode: string;
  version: string;
  url: string;
  numPlayers: number;
  maxPlayers: number;
  serverName: string;
  serverRegion: string;
}
