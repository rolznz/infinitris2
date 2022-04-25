import IEntity from './IEntity';

export type InvoiceData =
  | {
      type: 'createUser';
      email: string;
    }
  | {
      type: 'buyCoins';
      userId: string;
      amount: number;
    };
/* | {
      type: 'purchase';
      userId: string;
      entityCollectionPath: 'characters';
      entityId: string;
    };*/

export interface IPayment extends Omit<IEntity, 'userId'> {
  readonly type: InvoiceData['type'];
  readonly amount: number;
  readonly status: 'pending' | 'completed' | 'failed';
  readonly userId?: string;
  readonly memo: string;
  readonly email?: string;
}
