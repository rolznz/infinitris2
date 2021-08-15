import React, { useState } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Link,
  makeStyles,
  TextField,
} from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import useHomeStore from '../../../state/HomeStore';
import RoomCard from '../../RoomCard';
import Routes from '../../../models/Routes';
import { FormattedMessage, useIntl } from 'react-intl';

import { IRoom, roomsPath } from 'infinitris2-models';
import { useCollection } from '@nandorojo/swr-firestore';
import { useUserStore } from '../../../state/UserStore';
import useAuthStore from '@/state/AuthStore';
import useIncompleteChallenges from '../../hooks/useIncompleteChallenges';

import logoImage from './assets/logo.png';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import FlexBox from '@/components/ui/FlexBox';
import { useEffect } from 'react';
import { storage } from '@/firebase';
import ReactHowler from 'react-howler';
import useWindowSize from 'react-use/lib/useWindowSize';

let backgroundAlreadyLoaded = false;

export default function HomePage({
  backgroundLoaded,
}: {
  backgroundLoaded: boolean;
}) {
  const userStore = useUserStore();
  const isLoggedIn = useAuthStore((authStore) => !!authStore.user);
  const homeStore = useHomeStore();
  const { data: rooms } = useCollection<IRoom>(roomsPath);
  const [hasFocusedPlayButton, setHasFocusedPlayButton] = useState(false);
  // TODO: move to music player
  const [musicOn] = useState(false);
  const selectedRoom = homeStore.selectedRoom || rooms?.[0];
  const [menuUrl, setMenuUrl] = useState<string>();
  const isLoading = !selectedRoom;
  const {
    incompleteChallenges,
    isLoadingOfficialChallenges,
  } = useIncompleteChallenges();

  backgroundAlreadyLoaded = backgroundAlreadyLoaded || backgroundLoaded;
  backgroundLoaded = backgroundLoaded || backgroundAlreadyLoaded;

  const windowSize = useWindowSize();
  const isLandscape = windowSize.width >= windowSize.height;

  useEffect(() => {
    if (musicOn) {
      storage
        .ref(`/music/menu.mp3`)
        .getDownloadURL()
        .then((url) => {
          console.log('Got download url: ', url);
          setMenuUrl(url);
        });
    }
  }, [musicOn]);

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
      {musicOn && menuUrl && (
        <ReactHowler src={menuUrl} playing loop html5 on />
      )}
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
      <TextField
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
      />
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

      <Box mt={4} display="flex" justifyContent="center">
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
        )
      </Box>
      <Box mt={8} />
    </FlexBox>
  );
}
