import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export interface IAffiliateReadOnlyProperties
  extends IEntityReadOnlyProperties {
  readonly numConversions: number;
}

export default interface IAffiliate extends IEntity {
  readonly readOnly: IAffiliateReadOnlyProperties;
}
