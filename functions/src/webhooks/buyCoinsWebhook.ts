import { BuyCoinsRequest, BuyCoinsResponse } from 'infinitris2-models';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createInvoice } from '../utils/createInvoice';

let LAST_REQ_MS = 0;

export const buyCoinsWebhook = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (now - LAST_REQ_MS < 5000) {
      res.status(StatusCodes.TOO_MANY_REQUESTS);
      return res.send();
    }
    LAST_REQ_MS = now;

    const buyCoinsRequest: BuyCoinsRequest = req.body;
    console.log('Buy coins request: ' + JSON.stringify(buyCoinsRequest));
    if (
      !buyCoinsRequest.userId ||
      !buyCoinsRequest.email ||
      (buyCoinsRequest.amount || 0) < 1
    ) {
      res.status(StatusCodes.BAD_REQUEST);
      return res.send();
    }

    const createInvoiceResult = await createInvoice(
      buyCoinsRequest.amount * 10,
      {
        type: 'buyCoins',
        userId: buyCoinsRequest.userId,
        amount: buyCoinsRequest.amount,
      },
      `${buyCoinsRequest.amount} Coins Purchase - ${buyCoinsRequest.email}`
    );

    res.status(StatusCodes.CREATED);
    const responseData: BuyCoinsResponse = {
      invoice: createInvoiceResult.payment_request,
      paymentId: createInvoiceResult.payment_hash,
    };
    res.json(responseData);
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
