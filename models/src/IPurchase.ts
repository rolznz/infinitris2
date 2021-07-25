import IEntity, { Creatable, IEntityReadOnlyProperties } from './IEntity';

export interface IPurchaseReadOnlyProperties extends IEntityReadOnlyProperties {
  readonly userId: string;
}

export interface IPurchase extends IEntity {
  readonly readOnly?: IPurchaseReadOnlyProperties;
  readonly entityCollectionPath: 'colors';
  readonly entityId: string;
}

export type CreatablePurchase = Creatable<IPurchase>;
