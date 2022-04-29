import { CreatePaymentResponse } from '@models/CreatePaymentResponse';

export type BuyCoinsRequest = {
  userId: string;
  email: string;
  amount: number;
};

export type BuyCoinsResponse = CreatePaymentResponse;
