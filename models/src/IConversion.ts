import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export interface IRatingReadOnlyProperties extends IEntityReadOnlyProperties {}

export interface IConversion extends IEntity {
  readOnly: IRatingReadOnlyProperties;
}
