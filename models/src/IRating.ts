import IEntity from './IEntity';

export default interface IRating extends IEntity {
  readonly value: number;
  readonly entityCollection: 'challenges';
  readonly entityId: string;
  readonly userId: string;
}
