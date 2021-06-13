import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export interface IRatingReadOnlyProperties extends IEntityReadOnlyProperties {
  readonly userId: string;
}

export default interface IRating extends IEntity {
  readonly readOnly: IRatingReadOnlyProperties;
  readonly value: number;
  readonly entityCollection: 'challenges';
  readonly entityId: string;
}
