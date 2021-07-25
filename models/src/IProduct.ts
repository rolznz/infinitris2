import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export interface IProductReadOnlyProperties extends IEntityReadOnlyProperties {
  readonly numPurchases: number;
}

export interface IProduct extends IEntity {
  readonly readOnly?: IProductReadOnlyProperties;
  readonly price: number;
}
