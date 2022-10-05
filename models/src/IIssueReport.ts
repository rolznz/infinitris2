import IEntity, { Creatable, IEntityReadOnlyProperties } from './IEntity';

export interface IIssueReportReadOnlyProperties
  extends IEntityReadOnlyProperties {}

export interface IIssueReport extends IEntity {
  readonly readOnly?: IIssueReportReadOnlyProperties;
  readonly entityCollectionPath: 'challengeAttempts';
  readonly entityId: string;
}

export type CreatableIssueReport = Creatable<IIssueReport>;
