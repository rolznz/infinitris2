import React from 'react';
import FlexBox from './ui/FlexBox';

export function TermsOfServicePage() {
  return (
    <FlexBox flex={1} marginX={10}>
      <h1>Terms of Service</h1>
      <p>Last updated: March 14, 2021</p>
      <p>
        By using this service you agree to the following:
        <ul>
          <li>You are over 13 years of age.</li>
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
      </p>
      <p>
        We may occasionally revise our terms of service by posting the changes
        here.
      </p>
    </FlexBox>
  );
}
