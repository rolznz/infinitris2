import IEntity from './IEntity';

export interface IServer extends IEntity {
  name: string;
  url: string;
  region: string;
  //version: string;
}
