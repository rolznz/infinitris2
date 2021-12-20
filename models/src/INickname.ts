import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export interface INicknameReadOnlyProperties
  extends IEntityReadOnlyProperties {}

export interface INickname extends IEntity {
  readonly readOnly?: INicknameReadOnlyProperties;
}
