import IEntity from './IEntity';

export type UserRequestType =
  | 'referredByAffiliate'
  | 'nickname'
  | 'color'
  | 'pattern';

export interface IUserRequest extends IEntity {
  requestType: UserRequestType;
}

export interface IReferredByAffiliateRequest extends IUserRequest {
  referredByAffiliateId: string;
  requestType: 'referredByAffiliate';
}

export interface INicknameRequest extends IUserRequest {
  requestType: 'nickname';
  nickname: string;
}
