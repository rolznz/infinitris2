import { Typography, SvgIcon, Box, Button, Link } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import FlexBox from '../../FlexBox';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
import { InfoSlide } from '../InfoSlide';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { closeDialog } from '@/state/DialogStore';
import challengeMakerImage from './assets/challengemaker_illustration_150ppi.png';

export function ImpactInfoIncreaseImpactSlide2() {
  return (
    <InfoSlide
      title={
        <FormattedMessage
          defaultMessage="Increase your Impact"
          description="Impact info slide 2 - increase impact title"
        />
      }
      titleAppend={
        <SvgIcon style={{ fontSize: '60px' }}>
          <ImpactIcon />
        </SvgIcon>
      }
      content={
        <FlexBox height="100%">
          <Typography variant="body1" mt={1}>
            <FormattedMessage
              defaultMessage="By creating challenges and receiving positive ratings!"
              description="Impact info slide 2 - increase impact by creating challenges"
            />
          </Typography>
          <img
            src={challengeMakerImage}
            style={{ height: '90px', marginBottom: '10px' }}
            alt="challenge maker"
          />
          <Box flex={1} />
          <Link
            component={RouterLink}
            underline="none"
            to={Routes.createChallenge}
            onClick={closeDialog}
          >
            <Button color="primary" variant="contained" size="large">
              <FormattedMessage
                defaultMessage="Create now"
                description="Coin info page - create challenge button"
              />
            </Button>
          </Link>
        </FlexBox>
      }
    />
  );
}
