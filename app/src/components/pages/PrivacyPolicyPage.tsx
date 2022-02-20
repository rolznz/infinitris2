import { appName } from '@/utils/constants';
import { Link, Typography } from '@mui/material';
import React from 'react';
import FlexBox from '../ui/FlexBox';
import { Page } from '../ui/Page';

export function PrivacyPolicyPage() {
  return (
    <Page title="Privacy Policy">
      <Typography variant="body1">Last updated: October 2, 2021</Typography>
      <Typography variant="body1">
        {appName} stores your gameplay progress in your browser's local storage.
        You are free to delete this at any time.
      </Typography>

      <Typography variant="body1">
        You may also login to {appName} through a social media integration such
        as Facebook or Google. We will store your email address under your user
        account and may use this information to send you emails related to{' '}
        {appName}. Any emails sent may contain a tracking beacon to determine
        whether or not the email has been opened.
      </Typography>
      <Typography variant="body1">
        Your {appName} user profile (nickname and any other information you
        provide by interacting with the service) may be shown on the
        {appName} scoreboard, lobby or other pages.
      </Typography>
      <Typography variant="body1">
        {appName} is a free game that does not intend to invade your privacy in
        any way. We do not intend to share your private information (e.g. email
        address), but there is always a chance that we could be hacked or
        legally asked to surrender this information. Use at your own risk. Your
        progress will be saved in your online account. If you wish to delete
        your account, please create a ticket on github (link in about page).
      </Typography>

      <Typography variant="body1">
        We also collect anonymous user data automatically in order to improve
        our service. This will happen whether or not you are logged in.
      </Typography>

      <Typography variant="body1">
        We have no control and take no responsibility of any personal
        information that is tracked by third party plugins or cloud
        infrastructure that we use in order to host this service, and take no
        responsibility for what happens on any services that clone, run and
        potentially alter the source code of {appName}.
      </Typography>

      <Typography variant="body1">
        {appName} is 100% open source. You may review the{' '}
        <Link href="https://github.com/rolznz/infinitris2">source code</Link>{' '}
        for further information. If you have any issues, please open a ticket
        our github (link in about page).
      </Typography>

      <Typography variant="body1">
        We may occasionally revise our privacy policy by posting the changes
        here.
      </Typography>
    </Page>
  );
}
