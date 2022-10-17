import { CreatePaymentResponse } from '@models/CreatePaymentResponse';

export type CreateUserRequest = {
  email: string;
};

export type CreateUserResponse =
  | ({ isFreeSignup: false } & CreatePaymentResponse)
  | { isFreeSignup: true };
