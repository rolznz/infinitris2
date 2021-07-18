import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export interface IConversionReadOnlyProperties
  extends IEntityReadOnlyProperties {}

export interface IConversion extends IEntity {
  readOnly?: IConversionReadOnlyProperties;
}
