import IEntity, { Creatable, IEntityReadOnlyProperties } from './IEntity';

export interface IPurchaseReadOnlyProperties
  extends IEntityReadOnlyProperties {}

export interface IPurchase extends IEntity {
  readonly readOnly?: IPurchaseReadOnlyProperties;
  readonly entityCollectionPath: 'characters';
  readonly entityId: string;
}

export type CreatablePurchase = Creatable<IPurchase>;
