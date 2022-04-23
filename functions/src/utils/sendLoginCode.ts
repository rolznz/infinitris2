import { sendEmail } from './sendEmail';

export function sendLoginCode(email: string, code: string) {
  return sendEmail(
    email,
    'Infinitris Login Code',
    `Please enter the following code within 10 minutes: <span style="font-size: 2rem;">${code}</span>.` +
      '<br/><br/>Please do not reply to this email.'
  );
}
