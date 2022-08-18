import {
  MenuItem,
  Select,
  Grid,
  Link,
  Button,
  Slider,
  TextField,
} from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';
import { defaultLocale, supportedLocales } from '../../../internationalization';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../../models/Routes';
import SettingsRow from './SettingsRow';
import {
  BlockShadowType,
  BlockShadowTypeValues,
  defaultKeyRepeatRate,
  GridLineType,
  GridLineTypeValues,
  InputMethod,
  RendererQuality,
  RendererType,
} from 'infinitris2-models';
import {
  setMusicPlaying,
  setSfxOn,
  playSound,
  SoundKey,
  setMusicOn,
  setMusicVolume,
  setSfxVolume,
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
  clearProgress,
  setUserMusicVolume,
  setUserSfxVolume,
  setUserGridLineType,
  setUserBlockShadowType,
  setUserShowFaces,
  setUserShowPatterns,
  setUserShowNicknames,
  setUserUseCustomRepeat,
  setUserCustomRepeatInitialDelay,
  setUserCustomRepeatRate,
  setUserShowUI,
} from '@/state/updateUser';
import { useUser } from '@/components/hooks/useUser';
import { getDefaultPreferredInputMethod } from '@/state/LocalUserStore';

import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FlexBox from '../../ui/FlexBox';
import { defaultKeyRepeatInitialDelay } from 'infinitris2-models';

export const LanguagePicker = React.memo(
  () => {
    const user = useUser();
    return <LanguagePickerInternal locale={user.locale || defaultLocale} />;
  },
  () => true
);
const LanguagePickerInternal = React.memo(
  ({ locale }: { locale: string }) => {
    return (
      <Select
        value={locale}
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
  },
  (prevProps, nextProps) => prevProps.locale === nextProps.locale
);

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
                defaultMessage="Grid Type"
                description="Settings Page Table - Grid Type column"
              />
            }
            right={
              <Select
                value={user.gridLineType || 'none'}
                onChange={(event) =>
                  setUserGridLineType(event.target.value as GridLineType)
                }
              >
                {GridLineTypeValues.filter((value) => value !== 'editor').map(
                  (lineType) => (
                    <MenuItem key={lineType} value={lineType}>
                      {lineType.toUpperCase()}
                    </MenuItem>
                  )
                )}
              </Select>
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Block Shadow Type"
                description="Settings Page Table - Block Shadow Type column"
              />
            }
            right={
              <Select
                value={user.blockShadowType || 'full'}
                onChange={(event) =>
                  setUserBlockShadowType(event.target.value as BlockShadowType)
                }
              >
                {BlockShadowTypeValues.map((blockShadowType) => (
                  <MenuItem key={blockShadowType} value={blockShadowType}>
                    {blockShadowType.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Show Game UI (Leaderboard, chat etc)"
                description="Settings Page Table - Show Game UI"
              />
            }
            right={
              <IconSwitch
                checked={user.showUI !== false}
                onChange={(event) => {
                  setUserShowUI(event.target.checked);
                }}
              />
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Show Faces"
                description="Settings Page Table - Show Faces"
              />
            }
            right={
              <IconSwitch
                checked={user.showFaces !== false}
                onChange={(event) => {
                  setUserShowFaces(event.target.checked);
                }}
              />
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Show Patterns"
                description="Settings Page Table - Show Patterns"
              />
            }
            right={
              <IconSwitch
                checked={user.showPatterns !== false}
                onChange={(event) => {
                  setUserShowPatterns(event.target.checked);
                }}
              />
            }
          />
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Show Nicknames"
                description="Settings Page Table - Show Nicknames"
              />
            }
            right={
              <IconSwitch
                checked={user.showNicknames !== false}
                onChange={(event) => {
                  setUserShowNicknames(event.target.checked);
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
                checked={user.musicOn !== false}
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
          {user.musicOn !== false && (
            <SettingsRow
              left={
                <FormattedMessage
                  defaultMessage="Music Volume"
                  description="Settings Page Table - Music Volume"
                />
              }
              right={
                <FlexBox
                  gap={2}
                  flexDirection="row"
                  alignItems="center"
                  width={200}
                >
                  <VolumeDownIcon />
                  <Slider
                    aria-label="Volume"
                    min={0}
                    max={1}
                    step={0.01}
                    value={
                      user.musicVolume !== undefined ? user.musicVolume : 1
                    }
                    onChangeCommitted={(_, volume) => {
                      setUserMusicVolume(volume as number);
                    }}
                    onChange={(_, volume) => {
                      setMusicVolume(volume as number);
                    }}
                  />
                  <VolumeUpIcon />
                </FlexBox>
              }
            />
          )}
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
          {user.sfxOn !== false && (
            <SettingsRow
              left={
                <FormattedMessage
                  defaultMessage="SFX Volume"
                  description="Settings Page Table - SFX Volume"
                />
              }
              right={
                <FlexBox
                  gap={2}
                  flexDirection="row"
                  alignItems="center"
                  width={200}
                >
                  <VolumeDownIcon />
                  <Slider
                    aria-label="Volume"
                    min={0}
                    max={1}
                    step={0.01}
                    value={user.sfxVolume !== undefined ? user.sfxVolume : 1}
                    onChangeCommitted={(_, volume) => {
                      setUserSfxVolume(volume as number);
                    }}
                    onChange={(_, volume) => {
                      setSfxVolume(volume as number);
                      playSound(SoundKey.click);
                    }}
                  />
                  <VolumeUpIcon />
                </FlexBox>
              }
            />
          )}
          <SettingsRow
            left={
              <FormattedMessage
                defaultMessage="Preferred Input"
                description="Settings Page Table - Preferred Input Method left column"
              />
            }
            right={
              <Select
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
          {user.preferredInputMethod !== 'touch' && (
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
                  to={`${Routes.controlSettings}?type=${
                    user.preferredInputMethod || 'keyboard'
                  }`}
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
          {user.preferredInputMethod !== 'touch' && (
            <SettingsRow
              left={
                <FormattedMessage
                  defaultMessage="Custom DAS"
                  description="Settings Page Table - Custom DAS left column"
                />
              }
              right={
                <IconSwitch
                  checked={user.useCustomRepeat === true}
                  onChange={(event) => {
                    setUserUseCustomRepeat(event.target.checked);
                  }}
                />
              }
            />
          )}
          {user.useCustomRepeat === true && (
            <SettingsRow
              left={
                <FormattedMessage
                  defaultMessage="Custom DAS - Initial Repeat Delay (ms)"
                  description="Settings Page Table - Custom DAS Initial Repeat left column"
                />
              }
              right={
                <TextField
                  defaultValue={(
                    user.customRepeatInitialDelay ||
                    defaultKeyRepeatInitialDelay
                  ).toString()}
                  onChange={(event) => {
                    setUserCustomRepeatInitialDelay(
                      parseInt(event.target.value)
                    );
                  }}
                />
              }
            />
          )}
          {user.useCustomRepeat === true && (
            <SettingsRow
              left={
                <FormattedMessage
                  defaultMessage="Custom DAS - Repeat Rate (ms)"
                  description="Settings Page Table - Custom DAS Repeat Rate left column"
                />
              }
              right={
                <TextField
                  defaultValue={(
                    user.customRepeatRate || defaultKeyRepeatRate
                  ).toString()}
                  onChange={(event) => {
                    setUserCustomRepeatRate(parseInt(event.target.value));
                  }}
                />
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
                color="error"
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
          />
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
