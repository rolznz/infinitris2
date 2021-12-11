import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';

import TouchAppIcon from '@mui/icons-material/TouchApp';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import useIncompleteChallenges from '../hooks/useIncompleteChallenges';
import FlexBox from '../ui/FlexBox';
import Lottie from 'lottie-react';
import welcomeAnimation from '../lottie/welcome.json';
import { FormattedMessage } from 'react-intl';

import { useUserStore } from '../../state/UserStore';
import { InputMethod } from 'infinitris2-models';

export default function WelcomePage() {
  const userStore = useUserStore();
  const [newPreferredInputMethod, setNewPreferredInputMethod] = useState<
    InputMethod | undefined
  >(undefined);

  /*const useStyles = makeStyles({
    icon: {
      width: 'min(20vw, 20vh)',
      height: 'min(20vw, 20vh)',
      marginBottom: 'min(4vw, 4vh)',
    },
    card: {
      marginLeft: 'min(5vw, 5vh)',
      marginRight: 'min(5vw, 5vh)',
      padding: 'min(5vw, 5vh)',
      cursor: 'pointer',
    },
  });*/

  function ControlOptionCard(props: { option: InputMethod }) {
    const classes = { icon: '', card: '' };
    const Icon = props.option === 'keyboard' ? KeyboardIcon : TouchAppIcon;
    const text =
      props.option === 'keyboard' ? (
        <FormattedMessage
          defaultMessage="Keyboard"
          description="Choose keyboard controls"
        />
      ) : (
        <FormattedMessage
          defaultMessage="Touchscreen"
          description="Choose touch controls"
        />
      );

    return (
      <Card
        className={classes.card}
        onClick={() => setNewPreferredInputMethod(props.option)}
      >
        <FlexBox>
          <Icon className={classes.icon} />
          <Button variant="contained">{text}</Button>
        </FlexBox>
      </Card>
    );
  }

  const { setPreferredInputMethod, markHasSeenWelcome } = userStore;

  const history = useHistory();

  const { incompleteChallenges } = useIncompleteChallenges();

  useEffect(() => {
    if (newPreferredInputMethod) {
      markHasSeenWelcome();
      setPreferredInputMethod(newPreferredInputMethod);
      history.push(
        incompleteChallenges.length ? Routes.challengeRequired : Routes.home
      );
    }
  }, [
    setPreferredInputMethod,
    markHasSeenWelcome,
    history,
    newPreferredInputMethod,
    incompleteChallenges,
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
