import { getCurrentTimestamp, getDb } from './firebase';
import { getLoginCodePath, LoginCode } from 'infinitris2-models';

export async function generateLoginCode(
  email: string,
  allowUserCreation = false
) {
  const loginCodeRef = getDb().doc(getLoginCodePath(email));

  const loginCode: LoginCode = {
    code: Math.random().toString(16).slice(2, 8).toUpperCase(),
    createdDateTime: getCurrentTimestamp(),
    numAttempts: 0,
    allowUserCreation,
  };
  await loginCodeRef.set(loginCode);
  return loginCode;
}
