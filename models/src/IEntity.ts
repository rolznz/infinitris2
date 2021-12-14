import Timestamp from './Timestamp';

export interface IEntityReadOnlyProperties {
  readonly createdTimestamp: Timestamp;
  readonly lastModifiedTimestamp: Timestamp;
  readonly numTimesModified: number;
}

export default interface IEntity {
  readonly readOnly?: IEntityReadOnlyProperties;
  /**
   * Stored separately and initially written as false by client, to allow filtering to find resources that
   * have not been created yet (firestore does not support filtering by non-existent property)
   */
  readonly created: boolean;
  /**
   * Firestore functions seem to not have access to the user's ID and must be checked through rules instead.
   */
  readonly userId: string;
}

export type Creatable<T extends IEntity> = Omit<T, 'readOnly'> & {
  created: false;
};
export type Updatable<T extends IEntity> = Omit<T, 'readOnly' | 'created'>;
