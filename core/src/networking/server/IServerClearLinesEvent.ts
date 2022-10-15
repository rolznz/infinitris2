import { PartialClearRow } from '@models/IGrid';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerClearLinesEvent extends IServerMessage {
  rows: number[];
  partialClears: PartialClearRow[];
}
