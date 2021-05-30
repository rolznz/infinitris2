import Timestamp from './Timestamp';

export interface IEntityReadOnlyProperties {
  readonly createdTimestamp?: Timestamp;
}

export default interface IEntity {
  readonly readOnly?: IEntityReadOnlyProperties;
}
