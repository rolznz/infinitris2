import IEntity, { Creatable, IEntityReadOnlyProperties } from './IEntity';

export interface IRatingReadOnlyProperties extends IEntityReadOnlyProperties {}

export default interface IRating extends IEntity {
  readonly readOnly?: IRatingReadOnlyProperties;
  readonly value: number;
  readonly entityCollectionPath: 'challenges';
  readonly entityId: string;
}

export type CreatableRating = Creatable<IRating>;
