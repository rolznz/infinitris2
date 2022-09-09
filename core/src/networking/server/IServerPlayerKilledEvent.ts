import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerPlayerKilledEvent extends IServerMessage {
  victimId: number;
  attackerId: number;
}
