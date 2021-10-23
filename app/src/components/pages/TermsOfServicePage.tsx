import React from 'react';
import { Page } from '../ui/Page';
import { Typography } from '@material-ui/core';

export function TermsOfServicePage() {
  return (
    <Page title="Terms of Service">
      <Typography variant="body1">Last updated: October 11, 2021</Typography>
      <Typography variant="body1">
        By using this service you agree to the following:
        <ul>
          <li>
            You are responsible of your own activity on this service, including
            anything that you share with others.
          </li>
          <li>
            You will use the service for constructive purposes, without the
            intent to hurt others in any way.
          </li>
          <li>
            We take no responsibility for any any harm to your computer system,
            loss or corruption of data, or other harm that results from your
            access to or use of the Site or Services. Use at your own risk.
          </li>
          <li>
            Nominated admins or moderators have the right to delete your account
            or any content you have shared and without warning.
          </li>
          <li>
            This service does not take responsibility for any content shared by
            its users.
          </li>
          <li>
            Characters are randomly generated and do not represent real people
            nor intend to cause offense.
          </li>
          <li>
            We work on this FREE game at a loss of our own time, money and
            energy to provide something constructive and in our small part make
            the world a better place. If you are a greedy person or company
            reading this terms of service or privacy policy in the aim to find
            exploits so that you can shut down our service or otherwise attack
            the creators of this project, maybe you should reconsider your
            purpose in life and make something unique of your own rather than
            destroying the dreams of others.
          </li>
        </ul>
      </Typography>
      <Typography variant="body1">
        We may occasionally revise our terms of service by posting the changes
        here.
      </Typography>
    </Page>
  );
}
