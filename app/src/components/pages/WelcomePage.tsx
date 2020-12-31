import React, { useEffect } from 'react';
import { Box, Card, makeStyles, Typography } from '@material-ui/core';
import useAppStore from '../../state/AppStore';

import TouchAppIcon from '@material-ui/icons/TouchApp';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useIncompleteTutorials from '../hooks/useIncompleteTutorials';
import FlexBox from '../layout/FlexBox';
import Lottie from 'lottie-react';
import welcomeAnimation from '../lottie/welcome.json';
import useReceivedInput from '../hooks/useReceivedInput';
import { FormattedMessage } from 'react-intl';
import useDemo from '../hooks/useDemo';

export default function WelcomePage() {
  useDemo();
  const appStore = useAppStore();

  const useStyles = makeStyles({
    icon: {
      width: 'min(20vw, 20vh)',
      height: 'min(20vw, 20vh)',
      marginBottom: 'min(2vw, 2vh)',
    },
    card: {
      marginLeft: 'min(5vw, 5vh)',
      marginRight: 'min(5vw, 5vh)',
      padding: 'min(5vw, 5vh)',
    },
  });

  function ControlOptionCard(props: { option: 'keyboard' | 'touch' }) {
    const classes = useStyles();
    const Icon = props.option === 'keyboard' ? KeyboardIcon : TouchAppIcon;
    const text =
      props.option === 'keyboard' ? (
        <FormattedMessage
          defaultMessage="Press Enter"
          description="Choose keyboard controls"
        />
      ) : (
        <FormattedMessage
          defaultMessage="Tap Anywhere"
          description="Choose touch controls"
        />
      );

    return (
      <Card className={classes.card}>
        <FlexBox>
          <Icon className={classes.icon} />
          <Typography align="center">{text}</Typography>
        </FlexBox>
      </Card>
    );
  }

  const { setPreferredInputMethod, markHasSeenWelcome } = appStore;

  const history = useHistory();
  const [, newPreferredInputMethod] = useReceivedInput();

  const incompleteTutorials = useIncompleteTutorials();

  useEffect(() => {
    if (newPreferredInputMethod) {
      markHasSeenWelcome();
      setPreferredInputMethod(newPreferredInputMethod);
      history.replace(
        incompleteTutorials.length ? Routes.tutorialRequired : Routes.home
      );
    }
  }, [
    setPreferredInputMethod,
    markHasSeenWelcome,
    history,
    newPreferredInputMethod,
    incompleteTutorials,
  ]);

  return (
    <>
      <FlexBox flex={1}>
        <Lottie
          animationData={welcomeAnimation}
          loop={true}
          style={{ maxWidth: 150 }}
        />
        <Box marginY={2}>
          <Typography variant="h6">
            <FormattedMessage
              defaultMessage="Control Select"
              description="Control selection heading"
            />
          </Typography>
        </Box>

        <FlexBox flexDirection="row">
          <ControlOptionCard option="touch" />
          <ControlOptionCard option="keyboard" />
        </FlexBox>
      </FlexBox>
    </>
  );
}
