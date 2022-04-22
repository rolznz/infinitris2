import * as nodemailer from 'nodemailer';
import * as functions from 'firebase-functions';

const emailUser = functions.config().webhooks.email_user;
const emailPassword = functions.config().webhooks.email_password;

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

export function sendEmail(to: string, subject: string, html: string) {
  return transport.sendMail({
    to,
    subject,
    html,
    from: 'Infinitris Bot',
  });
}
