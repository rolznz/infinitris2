import { CreateUserRequest, CreateUserResponse } from 'infinitris2-models';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createInvoice } from '../utils/createInvoice';

let LAST_REQ_MS = 0;

/**
 * This function simply creates an *invoice* with the user's email.
 * To proceed with the creation process, the user must pay the invoice.
 * This process exists to stop spam and encourage global adoption of Bitcoin.
 */
export const createUserWebhook = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (now - LAST_REQ_MS < 5000) {
      res.status(StatusCodes.TOO_MANY_REQUESTS);
      return res.send();
    }
    LAST_REQ_MS = now;

    const createUserRequest: CreateUserRequest = req.body;
    if (!createUserRequest.email) {
      res.status(StatusCodes.BAD_REQUEST);
      return res.send();
    }

    const invoice = await createInvoice(
      1,
      {
        type: 'createUser',
        email: createUserRequest.email,
      },
      `Infinitris Signup - ${createUserRequest.email}`
    );

    res.status(StatusCodes.CREATED);
    const responseData: CreateUserResponse = { invoice };
    res.json(responseData);
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
