import React from 'react';
import {
  Typography,
  MenuItem,
  Select,
  Grid,
  Box,
  Link,
  Button,
} from '@material-ui/core';

import FlexBox from '../../ui/FlexBox';

import { FormattedMessage } from 'react-intl';
import { supportedLocales } from '../../../internationalization';
import { useUserStore } from '../../../state/UserStore';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../../models/Routes';
import SettingsRow from './SettingsRow';
import { InputMethod } from 'infinitris2-models';

export default function SettingsPage() {
  const userStore = useUserStore();

  return (
    <>
      <FlexBox flex={1} justifyContent="flex-start">
        <Typography variant="h6">
          <FormattedMessage
            defaultMessage="Settings"
            description="Settings Header"
          />
        </Typography>
        <Box mb={2} />
        <FlexBox width={300}>
          <Grid container spacing={2} alignItems="center" justify="center">
            <SettingsRow
              left={
                <FormattedMessage
                  defaultMessage="Language"
                  description="Settings Page Table - Language left column"
                />
              }
              right={
                <Select
                  value={userStore.user.locale}
                  onChange={(event) =>
                    userStore.setLocale(event.target.value as string)
                  }
                >
                  {supportedLocales.map((language) => (
                    <MenuItem key={language} value={language}>
                      {language.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              }
            />
            <SettingsRow
              left={
                <FormattedMessage
                  defaultMessage="Preferred Input Method"
                  description="Settings Page Table - Preferred Input Method left column"
                />
              }
              right={
                <Select
                  value={userStore.user.preferredInputMethod}
                  onChange={(event) =>
                    userStore.setPreferredInputMethod(
                      event.target.value as InputMethod
                    )
                  }
                >
                  {['keyboard', 'touch'].map((inputMethod) => (
                    <MenuItem key={inputMethod} value={inputMethod}>
                      {inputMethod.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              }
            />
            {userStore.user.preferredInputMethod === 'keyboard' && (
              <SettingsRow
                left={
                  <FormattedMessage
                    defaultMessage="Controls"
                    description="Settings Page Table - Controls left column"
                  />
                }
                right={
                  <Link
                    component={RouterLink}
                    underline="none"
                    to={`${Routes.controlSettings}`}
                  >
                    <Button variant="contained" color="primary">
                      <FormattedMessage
                        defaultMessage="Change"
                        description="Settings Page Table - Change controls button text"
                      />
                    </Button>
                  </Link>
                }
              />
            )}
            <SettingsRow
              left={
                <FormattedMessage
                  defaultMessage="Clear Progress"
                  description="Settings Page Table - Clear Progress left column"
                />
              }
              right={
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() =>
                    window.confirm(
                      'Are you sure you wish to clear your progress?'
                    ) && userStore.clearProgress()
                  }
                >
                  <FormattedMessage
                    defaultMessage="Clear"
                    description="Settings Page Table - Clear progress button text"
                  />
                </Button>
              }
            />
          </Grid>
        </FlexBox>
      </FlexBox>
    </>
  );
}
