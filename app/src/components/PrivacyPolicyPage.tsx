import { appName } from '@/utils/constants';
import React from 'react';
import FlexBox from './layout/FlexBox';

export function PrivacyPolicyPage() {
  return (
    <FlexBox flex={1} marginX={10}>
      <h1>Privacy Policy</h1>
      <p>Last updated: April 10, 2021</p>
      <p>
        {appName} stores your gameplay progress in your browser's local storage.
        You are free to delete this at any time.
      </p>

      <p>
        You may also login to {appName} through a social media integration such
        as Facebook or Google. We will store your display name and email address
        under your user account and may use this information to send you emails
        related to {appName}. You can update your nickname on the home page at
        any time, which will be saved in place of your Facebook/Google display
        name. Any emails sent may contain a tracking beacon to determine whether
        or not the email has been opened.
      </p>
      <p>
        Your {appName} user profile (nickname and any other information you
        provide by interacting with the service) may be shown on the
        {appName} scoreboard, lobby or other pages.
      </p>
      <p>
        {appName} is a free game that does not intend to invade your privacy in
        any way. We do not intend to share your private information (e.g. email
        address), but there is always a chance that we could be hacked or
        legally asked to surrender this information. Use at your own risk. Your
        progress will be saved in your online account. If you wish to delete
        your account, please create a ticket on github (link in footer).
      </p>

      <p>
        We also collect anonymous user data automatically in order to improve
        our service. This will happen whether or not you are logged in.
      </p>

      <p>
        We have no control and take no responsibility of any personal
        information that is tracked by third party plugins or cloud
        infrastructure that we use in order to host this service, and take no
        responsibility for what happens on any services that clone, run and
        potentially alter the source code of {appName}.
      </p>

      <p>
        {appName} is 100% open source. You may review the{' '}
        <a href="https://github.com/rolznz/infinitris2">source code</a> for
        further information. If you have any issues, please open a ticket our
        github (link in footer).
      </p>

      <p>
        We may occasionally revise our privacy policy by posting the changes
        here.
      </p>
    </FlexBox>
  );
}
