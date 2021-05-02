import IEntity from './IEntity';

export default interface IAffiliate extends IEntity {
  readonly userId: string;
  readonly referralCount?: number;
}
