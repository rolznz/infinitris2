import { MenuItem, Select, Grid, Link, Button } from '@mui/material';

import FlexBox from '../../ui/FlexBox';

import { FormattedMessage, useIntl } from 'react-intl';
import { supportedLocales } from '../../../internationalization';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../../models/Routes';
import SettingsRow from './SettingsRow';
import { InputMethod, RendererQuality, RendererType } from 'infinitris2-models';
import {
  setMusicPlaying,
  setSfxOn,
  playSound,
  SoundKey,
  setMusicOn,
} from '@/sound/SoundManager';
import { Page } from '@/components/ui/Page';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MusicOffIcon from '@mui/icons-material/MusicOff';
import useDarkMode from '@/components/hooks/useDarkMode';
import { IconSwitch } from '@/components/ui/IconSwitch';
import { ReactComponent as LightModeIcon } from '@/icons/lightmode.svg';
import { ReactComponent as DarkModeIcon } from '@/icons/darkmode.svg';
import React from 'react';
import { isPwa } from '@/utils/isMobile';
import {
  setUserAppTheme,
  setUserLocale,
  setUserMusicOn,
  setUserSfxOn,
  setUserPreferredInputMethod,
  setUserRendererQuality,
  setUserRendererType,
} from '@/state/updateUser';
import { useUser } from '@/components/hooks/useUser';
import { getDefaultPreferredInputMethod } from '@/state/LocalUserStore';

export function LanguagePicker() {
  const user = useUser();
  return (
    <Select
      disableUnderline
      value={user.locale}
      onChange={(event) => {
        setUserLocale(event.target.value as string);
        playSound(SoundKey.click);
      }}
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
  const user = useUser();
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
                  setUserAppTheme(event.target.checked ? 'dark' : 'light');
                  playSound(SoundKey.click);
                  //useLoaderStore.getState().reset();
                  //useLoaderStore.getState().initialize();
                }}
              />
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Graphics Quality"
                description="Settings Page Table - Graphics Quality left column"
              />
            }
            right={
              <Select
                disableUnderline
                value={user.rendererQuality || 'high'}
                onChange={(event) =>
                  setUserRendererQuality(event.target.value as RendererQuality)
                }
              >
                {(['low', 'medium', 'high'] as RendererQuality[]).map(
                  (rendererQuality) => (
                    <MenuItem key={rendererQuality} value={rendererQuality}>
                      {rendererQuality.toUpperCase()}
                    </MenuItem>
                  )
                )}
              </Select>
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Renderer"
                description="Settings Page Table - Renderer column"
              />
            }
            right={
              <Select
                disableUnderline
                value={user.rendererType || 'infinitris2'}
                onChange={(event) =>
                  setUserRendererType(event.target.value as RendererType)
                }
              >
                {(['infinitris2', 'minimal'] as RendererType[]).map(
                  (rendererQuality) => (
                    <MenuItem key={rendererQuality} value={rendererQuality}>
                      {rendererQuality.toUpperCase()}
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
              <IconSwitch
                checked={user.musicOn !== undefined ? user.musicOn : true}
                icon={<MusicOffIcon />}
                checkedIcon={<MusicNoteIcon />}
                onChange={(event) => {
                  const isPlaying = event.target.checked;
                  // if (isPlaying && !musicLoaded()) {
                  //   useLoaderStore.getState().reset();
                  // }
                  setUserMusicOn(isPlaying);
                  setMusicOn(isPlaying);
                  setMusicPlaying(isPlaying);
                  playSound(SoundKey.click);
                }}
              />
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Sound Effects"
                description="Settings Page Table - Sound Effects"
              />
            }
            right={
              <IconSwitch
                checked={user.sfxOn !== undefined ? user.sfxOn : true}
                icon={<MusicOffIcon />}
                checkedIcon={<MusicNoteIcon />}
                onChange={(event) => {
                  const isOn = event.target.checked;
                  // if (isOn && !soundsLoaded()) {
                  //   prepareSoundEffects();
                  // }
                  setUserSfxOn(isOn);
                  setSfxOn(isOn);
                  playSound(SoundKey.click);
                }}
              />
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Preferred Input"
                description="Settings Page Table - Preferred Input Method left column"
              />
            }
            right={
              <Select
                disableUnderline
                value={
                  user.preferredInputMethod || getDefaultPreferredInputMethod()
                }
                onChange={(event) =>
                  setUserPreferredInputMethod(event.target.value as InputMethod)
                }
              >
                {['keyboard', 'touch', 'gamepad'].map((inputMethod) => (
                  <MenuItem key={inputMethod} value={inputMethod}>
                    {inputMethod.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            }
          />
          {(user.preferredInputMethod === 'keyboard' ||
            user.preferredInputMethod === 'gamepad') && (
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
                  to={`${Routes.controlSettings}?type=${user.preferredInputMethod}`}
                  onClick={() => playSound(SoundKey.click)}
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
          {/*<SettingsRow
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
                  ) && clearProgress()
                }
              >
                <FormattedMessage
                  defaultMessage="Clear"
                  description="Settings Page Table - Clear progress button text"
                />
              </Button>
            }
          />*/}
          {isPwa() && (
            <SettingsRow
              left={
                <FormattedMessage
                  defaultMessage="Reload Application"
                  description="Settings Page Table - Reload Application left column"
                />
              }
              right={
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => window.location.reload()}
                >
                  <FormattedMessage
                    defaultMessage="Reload"
                    description="Settings Page Table - Reload Application button text"
                  />
                </Button>
              }
            />
          )}
        </Grid>
      </FlexBox>
    </Page>
  );
}
