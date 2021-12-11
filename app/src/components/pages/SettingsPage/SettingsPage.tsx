import React from 'react';
import {
  Typography,
  MenuItem,
  Select,
  Grid,
  Box,
  Link,
  Button,
  Switch,
  Paper,
  SwitchProps,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  createTheme,
  SvgIcon,
} from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

import FlexBox from '../../ui/FlexBox';

import { FormattedMessage, useIntl } from 'react-intl';
import { supportedLocales } from '../../../internationalization';
import { useUserStore } from '../../../state/UserStore';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../../models/Routes';
import SettingsRow from './SettingsRow';
import { InputMethod, AppTheme } from 'infinitris2-models';
import { setMusicPlaying, soundsLoaded } from '@/components/sound/MusicPlayer';
import { Page } from '@/components/ui/Page';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MusicOffIcon from '@mui/icons-material/MusicOff';
import useLoaderStore from '@/state/LoaderStore';
import useDarkMode from '@/components/hooks/useDarkMode';
import { IconSwitch } from '@/components/ui/IconSwitch';
import { ReactComponent as LightModeIcon } from '@/icons/lightmode.svg';
import { ReactComponent as DarkModeIcon } from '@/icons/darkmode.svg';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


export function LanguagePicker() {
  const userStore = useUserStore();
  console.log(userStore.user.locale, supportedLocales);
  return (
    <Select
      disableUnderline
      value={userStore.user.locale}
      onChange={(event) => userStore.setLocale(event.target.value as string)}
    >
      {supportedLocales.map((language) => (
        <MenuItem key={language} value={language}>
          {language.toUpperCase()}
        </MenuItem>
      ))}
    </Select>
  );
}

export default function SettingsPage() {
  const intl = useIntl();
  const userStore = useUserStore();
  const isDarkMode = useDarkMode();

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Settings',
        description: 'Settings page title',
      })}
    >
      <FlexBox width={400} maxWidth="100%">
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Language"
                description="Settings Page Table - Language left column"
              />
            }
            right={<LanguagePicker />}
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="App Theme"
                description="Settings Page Table - App Theme"
              />
            }
            right={
              <IconSwitch
                checked={isDarkMode}
                checkediconStyle={{ color: 'black' }}
                iconStyle={{ color: 'white' }}
                icon={<LightModeIcon />}
                checkedIcon={<DarkModeIcon />}
                onChange={(event) => {
                  userStore.setAppTheme(
                    event.target.checked ? 'dark' : 'light'
                  );
                  //useLoaderStore.getState().reset();
                  //useLoaderStore.getState().initialize();
                }}
              />
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Music"
                description="Settings Page Table - Music"
              />
            }
            right={
              <IconSwitch
                checked={
                  userStore.user.musicOn !== undefined
                    ? userStore.user.musicOn
                    : true
                }
                icon={<MusicOffIcon />}
                checkedIcon={<MusicNoteIcon />}
                onChange={(event) => {
                  const isPlaying = event.target.checked;
                  if (!soundsLoaded()) {
                    useLoaderStore.getState().reset();
                  }
                  userStore.setMusicOn(isPlaying);
                  setMusicPlaying(isPlaying);
                }}
              />
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Input"
                description="Settings Page Table - Preferred Input Method left column"
              />
            }
            right={
              <Select
                disableUnderline
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
    </Page>
  );
}
