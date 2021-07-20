import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export interface INicknameReadOnlyProperties extends IEntityReadOnlyProperties {
  readonly userId?: string;
}

export interface INickname extends IEntity {
  readonly readOnly?: INicknameReadOnlyProperties;
}
