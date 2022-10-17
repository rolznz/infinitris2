import {
  CreateUserRequest,
  CreateUserResponse,
  getSettingPath,
  objectToDotNotation,
  PremiumSettings,
} from 'infinitris2-models';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createInvoice } from '../utils/createInvoice';
import { getDb, increment } from '../utils/firebase';
import { sendLoginCode } from '../utils/sendLoginCode';
import { generateLoginCode } from '../utils/generateLoginCode';

let LAST_REQ_MS = 0;

/**
 * This function either creates an *invoice* with the user's email (paid signup) or sends a login code (free signup).
 * To proceed with the creation process, the user must pay the invoice or enter the code.
 */
export const createUserWebhook = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (now - LAST_REQ_MS < 1000) {
      res.status(StatusCodes.TOO_MANY_REQUESTS);
      return res.send();
    }
    LAST_REQ_MS = now;

    const createUserRequest: CreateUserRequest = req.body;
    console.log('Create user request: ' + JSON.stringify(createUserRequest));
    if (!createUserRequest.email) {
      res.status(StatusCodes.BAD_REQUEST);
      return res.send();
    }
    const premiumSettingsDoc = getDb().doc(getSettingPath('premium'));

    const premiumSettings = (await premiumSettingsDoc.get()).data() as
      | PremiumSettings
      | undefined;
    if ((premiumSettings?.freeAccountsRemaining ?? 0) > 0) {
      const updatePremiumSettings = objectToDotNotation<PremiumSettings>(
        {
          freeAccountsRemaining: increment(-1),
        },
        ['freeAccountsRemaining']
      );
      await premiumSettingsDoc.update(updatePremiumSettings);
      const loginCode = await generateLoginCode(createUserRequest.email, true);
      await sendLoginCode(createUserRequest.email, loginCode.code);

      const responseData: CreateUserResponse = {
        isFreeSignup: true,
      };
      res.status(StatusCodes.CREATED).json(responseData);
      return res.send();
    } else {
      const createInvoiceResult = await createInvoice(
        1000,
        {
          type: 'createUser',
          email: createUserRequest.email,
        },
        `Infinitris Signup - ${createUserRequest.email}`
      );

      const responseData: CreateUserResponse = {
        invoice: createInvoiceResult.payment_request,
        paymentId: createInvoiceResult.payment_hash,
        isFreeSignup: false,
      };
      res.status(StatusCodes.CREATED).json(responseData);
      return res.send();
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
