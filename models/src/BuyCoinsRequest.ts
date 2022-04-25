import { CreatePaymentResponse } from '@models/CreatePaymentResponse';

export type BuyCoinsRequest = {
  userId: string;
  amount: number;
};

export type BuyCoinsResponse = CreatePaymentResponse;
