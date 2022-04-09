import IRoom from '@models/IRoom';
import { IServer } from '@models/IServer';

export type UpdateServerRequest = {
  serverKey: string;
  server?: Omit<IServer, 'userId'>;
  rooms?: Omit<IRoom, 'userId'>[];
};
