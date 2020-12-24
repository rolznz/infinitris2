import React, { useEffect } from 'react';
import { Box, Card, makeStyles, Typography } from '@material-ui/core';
import useAppStore from '../../state/AppStore';

import TouchAppIcon from '@material-ui/icons/TouchApp';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import { useKeyPress } from 'react-use';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useTapListener from '../hooks/useTapListener';

export default function WelcomePage() {
  const appStore = useAppStore();

  const useStyles = makeStyles({
    icon: {
      width: 'min(20vw, 20vh)',
      height: 'min(20vw, 20vh)',
      marginBottom: 'min(2vw, 2vh)',
    },
    card: {
      margin: 'min(5vw, 5vh)',
      padding: 'min(5vw, 5vh)',
    },
  });

  function ControlOptionCard(props: { option: 'keyboard' | 'touch' }) {
    const classes = useStyles();
    const Icon = props.option === 'keyboard' ? KeyboardIcon : TouchAppIcon;
    const text = props.option === 'keyboard' ? 'Press Any Key' : 'Tap Anywhere';
    return (
      <Card className={classes.card}>
        <Icon className={classes.icon} />
        <Typography align="center">{text}</Typography>
      </Card>
    );
  }

  const { setPreferredInputMethod, user, markHasSeenWelcome } = appStore;
  const preferredInputMethod = user.preferredInputMethod;

  const history = useHistory();
  const [isAnyKeyPressed] = useKeyPress((event) => Boolean(event.key));
  const [hasTapped, TapListener] = useTapListener();

  if ((hasTapped || isAnyKeyPressed) && !preferredInputMethod) {
    setPreferredInputMethod(hasTapped ? 'touch' : 'keyboard');
  }

  useEffect(() => {
    if (preferredInputMethod) {
      markHasSeenWelcome();
      setPreferredInputMethod(preferredInputMethod);
      history.replace(Routes.tutorialRequired);
    }
  }, [
    setPreferredInputMethod,
    markHasSeenWelcome,
    history,
    preferredInputMethod,
  ]);

  return (
    <>
      <TapListener />
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography>Welcome to Infinitris 2!</Typography>
        <Typography>Please choose your preferred input method.</Typography>

        <Box display="flex">
          <ControlOptionCard option="touch" />
          <ControlOptionCard option="keyboard" />
        </Box>
      </Box>
    </>
  );
}
