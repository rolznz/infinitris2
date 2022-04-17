import { appName } from '@/utils/constants';
import { Link, Typography } from '@mui/material';
import { Page } from '../ui/Page';

export function PrivacyPolicyPage() {
  return (
    <Page title="Privacy Policy">
      <Typography variant="body1">Last updated: April 17, 2022</Typography>
      <Typography variant="body2">
        {appName} stores your gameplay progress in your browser's local storage.
        You are free to delete this at any time.
      </Typography>

      <Typography variant="body2">
        You may also login to {appName} using an email address. We will store
        that email address under your user account and may use this information
        to send you emails related to {appName}. Please use an anonymous email
        address if you are worried about your privacy.
      </Typography>
      <Typography variant="body2">
        Your {appName} user profile (nickname and any other information you
        provide by interacting with the service) may be shown on the
        {appName} scoreboard, lobby or other pages.
      </Typography>
      <Typography variant="body2">
        {appName} is a free game that does not intend to invade your privacy in
        any way. We do not intend to share your private information (e.g. email
        address), but there is always a chance that we could be hacked or
        legally forced to surrender this information. Use at your own risk. Your
        progress will be saved in your online account. If you wish to delete
        your account, please create a ticket on github (link in about page).
      </Typography>

      <Typography variant="body2">
        We also collect anonymous user data automatically in order to improve
        our service. This will happen whether or not you are logged in.
      </Typography>

      <Typography variant="body2">
        We have no control and take no responsibility of any personal
        information that is tracked by third party plugins or cloud
        infrastructure that we use in order to host this service, and take no
        responsibility for what happens on any services that clone, run and
        potentially alter the source code of {appName}.
      </Typography>

      <Typography variant="body2">
        {appName} is 100% open source. You may review the{' '}
        <Link href="https://github.com/rolznz/infinitris2">source code</Link>{' '}
        for further information. If you have any issues, please open a ticket
        our github (link in about page).
      </Typography>

      <Typography variant="body2">
        We may occasionally revise our privacy policy by posting the changes
        here.
      </Typography>
    </Page>
  );
}
