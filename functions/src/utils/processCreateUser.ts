import * as admin from 'firebase-admin';

import { createFirebaseUser } from '../utils/firebase';
import { InvoiceData } from 'infinitris2-models';
import { sendLoginCode } from '../utils/sendLoginCode';
import { generateLoginCode } from '../utils/generateLoginCode';

export async function processCreateUser(
  data: InvoiceData & { type: 'createUser' },
  sendLoginCodeAfterUserCreation = true
): Promise<admin.auth.UserRecord> {
  console.log('create user: ' + JSON.stringify(data));
  const user = await createFirebaseUser(data.email);
  if (sendLoginCodeAfterUserCreation) {
    const loginCode = await generateLoginCode(data.email);
    await sendLoginCode(data.email, loginCode.code);
  }
  return user;
}
