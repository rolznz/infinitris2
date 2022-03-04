import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerClearLinesEvent extends IServerMessage {
  rows: number[];
}
