import IEntity from './IEntity';

export interface IProduct extends IEntity {
  readonly price: number;
  readonly numPurchases: number;
  readonly maxPurchases: number;
}
