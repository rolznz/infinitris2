import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerSimulationMessage extends IServerMessage {
  message: string;
  playerId: number | undefined;
}
