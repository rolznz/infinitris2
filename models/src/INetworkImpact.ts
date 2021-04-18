import IEntity from './IEntity';

export default interface INetworkImpact extends IEntity {
  readonly distance: number;
  readonly fromUserId: string;
  readonly toUserId: string;
}
