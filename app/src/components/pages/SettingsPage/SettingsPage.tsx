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

import FlexBox from '../../layout/FlexBox';
import useDemo from '../../hooks/useDemo';
import { FormattedMessage } from 'react-intl';
import { supportedLocales } from '../../../internationalization';
import useUserStore from '../../../state/UserStore';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../../models/Routes';
import SettingsRow from './SettingsRow';

export default function SettingsPage() {
  useDemo();
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
                  description="Language left column"
                />
              }
              right={
                <Select
                  value={userStore.user.locale}
                  onChange={(event) =>
                    userStore.setLanguageCode(event.target.value as string)
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
                  defaultMessage="Controls"
                  description="Controls left column"
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
                      description="Change controls text"
                    />
                  </Button>
                </Link>
              }
            />
          </Grid>
        </FlexBox>
      </FlexBox>
    </>
  );
}
