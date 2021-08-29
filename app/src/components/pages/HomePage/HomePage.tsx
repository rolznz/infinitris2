import React from 'react';
import {
  Box,
  IconButton,
  Link,
  makeStyles,
  TextField,
  useMediaQuery,
} from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';

import { useUserStore } from '../../../state/UserStore';

import logoImage from './assets/logo.png';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import FlexBox from '@/components/ui/FlexBox';
import useWindowSize from 'react-use/lib/useWindowSize';

let backgroundAlreadyLoaded = false;

export default function HomePage({
  backgroundLoaded,
}: {
  backgroundLoaded: boolean;
}) {
  const userStore = useUserStore();
  //const isLoggedIn = useAuthStore((authStore) => !!authStore.user);
  //const homeStore = useHomeStore();
  //const { data: rooms } = useCollection<IRoom>(roomsPath);
  // TODO: move to music player
  //const selectedRoom = homeStore.selectedRoom || rooms?.[0];
  //const isLoading = !selectedRoom;
  /*const {
    incompleteChallenges,
    isLoadingOfficialChallenges,
  } = useIncompleteChallenges();*/

  backgroundAlreadyLoaded = backgroundAlreadyLoaded || backgroundLoaded;
  backgroundLoaded = backgroundLoaded || backgroundAlreadyLoaded;

  const windowSize = useWindowSize();
  const isLandscape = windowSize.width >= windowSize.height;
  /*const shortLandscapeScreen =
    useMediaQuery('(max-height:400px)') && isLandscape;*/

  const useStyles = makeStyles({
    playButton: {
      backgroundColor: '#57bb50',
      borderColor: '#ffffff44',
      borderWidth: 6,
      borderStyle: 'solid',
      backgroundClip: 'padding-box',
      '&:hover': {
        backgroundColor: '#8ad785',
        filter: 'drop-shadow(0 0 0.75rem white) drop-shadow(0 0 1rem #ffffff)',
      },
      filter: 'drop-shadow(0 0 0.75rem white)',
      animation: `$playButtonAnimation 2000ms alternate infinite`,
      transform: 'scale(1.0)',
    },
    playButtonIcon: {
      width: 48,
      height: 48,
    },
    '@keyframes playButtonAnimation': {
      '0%': {
        transform: 'scale(1.0)',
        filter: 'drop-shadow(0 0 0.75rem white)',
      },
      '100%': {
        transform: 'scale(1.1)',
        filter: 'drop-shadow(0 0 0.75rem white) drop-shadow(0 0 1rem #ffffff)',
      },
    },
    nicknameInput: {
      '&::placeholder': {
        color: '#ffffffAA',
      },
    },
  });

  const classes = useStyles();
  const intl = useIntl();

  return (
    <FlexBox height="100%">
      {!isLandscape && <Box mt="10vh" />}
      <Box height={isLandscape ? '30vh' : '20vh'}>
        <img
          src={logoImage}
          alt="Logo"
          style={{
            width: 'auto',
            height: '100%',
            opacity: backgroundLoaded ? 1 : 0,
            transition: 'opacity 2s 0.5s',
          }}
        />
      </Box>
      <Box mt={4} />
      <FlexBox /*flexDirection={shortLandscapeScreen ? 'row' : 'column'}*/>
        {/*<TextField
          placeholder={intl.formatMessage({
            defaultMessage: 'Enter your nickname',
            description: 'Nickname textbox placeholder',
          })}
          value={userStore.user.readOnly?.nickname || ''}
          onChange={(e) => userStore.setNickname(e.target.value)}
          inputProps={{ style: { textAlign: 'center', color: '#ffffff' } }}
          InputProps={{
            classes: { input: classes.nicknameInput },
            disableUnderline: true,
            autoFocus: true,
            style: {
              backgroundColor: '#a7d9f5',
              borderRadius: 32,
              padding: 4,
              paddingLeft: 8,
              borderColor: '#ffffff44',
              borderWidth: 6,
              borderStyle: 'solid',
              backgroundClip: 'padding-box',
              filter: 'drop-shadow(0 0 0.75rem white)',
            },
          }}
          style={{
            opacity: backgroundLoaded ? 1 : 0,
            transition: 'opacity 2s 1s',
          }}
        />*/}
        {/*(isLoggedIn ||
                  (!isLoadingOfficialChallenges &&
                    !incompleteChallenges.length)) && (
                  <Box mt={2} px={1} style={{ opacity: 0.5 }}>
                    <Link
                      component={RouterLink}
                      underline="none"
                      to={Routes.lobby}
                      style={{ opacity: 0.5 }}
                    >
                      <RoomCard loading={isLoading} room={selectedRoom} />
                    </Link>
                  </Box>
                    )*/}
        {/*<Box
          mt={shortLandscapeScreen ? 0 : 4}
          ml={shortLandscapeScreen ? 4 : 0}
        />*/}
        <Box display="flex" justifyContent="center">
          <Link
            component={RouterLink}
            underline="none"
            to={/*`${Routes.rooms}/${selectedRoom?.id}`*/ '/'}
            style={
              /*isLoading
                  ? {
                      pointerEvents: 'none',
                    }
                  : */ {}
            }
          >
            <IconButton
              className={classes.playButton}
              style={{
                opacity: backgroundLoaded ? 1 : 0,
                transition: 'opacity 2s 1.5s',
              }}
            >
              <PlayArrowIcon className={classes.playButtonIcon} />
            </IconButton>
          </Link>
        </Box>
      </FlexBox>
      <Box mt={8} />
    </FlexBox>
  );
}
