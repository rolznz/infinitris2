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
  makeStyles,
  ThemeProvider,
  createTheme,
  SvgIcon,
} from '@material-ui/core';

import FlexBox from '../../ui/FlexBox';

import { FormattedMessage } from 'react-intl';
import { supportedLocales } from '../../../internationalization';
import { useUserStore } from '../../../state/UserStore';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../../models/Routes';
import SettingsRow from './SettingsRow';
import { InputMethod, AppTheme } from 'infinitris2-models';
import { setMusicPlaying } from '@/components/sound/MusicPlayer';
import { Page } from '@/components/ui/Page';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import MusicOffIcon from '@material-ui/icons/MusicOff';
import useLoaderStore from '@/state/LoaderStore';

function CustomIconSwitch(props: SwitchProps) {
  return (
    <ThemeProvider
      theme={createTheme({
        overrides: {
          MuiIconButton: {
            label: {
              background: 'red',
              borderRadius: '50%',
              marginTop: '-2px',
              padding: '2px', // FIXME:
            },
          },
        },
      })}
    >
      <Switch {...props} />
    </ThemeProvider>
  );
}

export default function SettingsPage() {
  const userStore = useUserStore();

  return (
    <Page
      title={
        <FormattedMessage
          defaultMessage="Settings"
          description="Settings Header"
        />
      }
    >
      <FlexBox width={400} maxWidth="100%">
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
                disableUnderline
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
                defaultMessage="App Theme"
                description="Settings Page Table - App Theme"
              />
            }
            right={
              <Select
                disableUnderline
                defaultValue="default"
                value={userStore.user.appTheme}
                onChange={(event) => {
                  const value = event.target.value as AppTheme;
                  userStore.setAppTheme(value);
                  useLoaderStore.getState().reset();
                  useLoaderStore.getState().initialize();
                }}
              >
                {(['light', 'dark', 'default'] as AppTheme[]).map(
                  (appTheme) => (
                    <MenuItem key={appTheme} value={appTheme}>
                      {appTheme.toUpperCase()}
                    </MenuItem>
                  )
                )}
              </Select>
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
              <CustomIconSwitch
                checked={
                  userStore.user.musicOn !== undefined
                    ? userStore.user.musicOn
                    : true
                }
                icon={
                  <SvgIcon fontSize="small">
                    <MusicOffIcon />
                  </SvgIcon>
                }
                checkedIcon={<MusicNoteIcon />}
                onChange={(event) => {
                  const isPlaying = event.target.checked;
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
