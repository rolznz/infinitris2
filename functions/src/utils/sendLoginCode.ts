import { sendEmail } from './sendEmail';

export function sendLoginCode(email: string, code: string) {
  return sendEmail(
    email,
    'Infinitris Login Code',
    `To login, enter the following code within 10 minutes: <span style="font-size: 2rem;">${code}</span>.` +
      '<br/><br/>If you did not attempt to login to Infinitris, please ignore this email.'
  );
}
