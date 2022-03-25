import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerEndRoundEvent extends IServerMessage {
  winnerId: number | undefined;
}
