import { Typography, SvgIcon, Box, Button, Link } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import FlexBox from '../../FlexBox';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
import { InfoSlide } from '../InfoSlide';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { closeDialog } from '@/state/DialogStore';
import friendImage from './assets/friends_illustration_150ppi.png';

export function ImpactInfoIncreaseImpactSlide3() {
  return (
    <InfoSlide
      title={
        <FormattedMessage
          defaultMessage="Increase your Impact"
          description="Impact info slide 3 - increase impact title"
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
              defaultMessage="By inviting your friends!"
              description="Impact info slide 3 - increase impact by inviting friends"
            />
          </Typography>
          <FlexBox flexDirection="row">
            <img
              src={friendImage}
              style={{
                height: '120px',
                marginTop: '10px',
                marginBottom: '10px',
              }}
              alt="friend"
            />
          </FlexBox>
          <Box flex={1} />
          <Link
            component={RouterLink}
            underline="none"
            to={Routes.affiliateProgram}
            onClick={closeDialog}
          >
            <Button color="primary" variant="contained" size="large">
              <FormattedMessage
                defaultMessage="Share now"
                description="Coin info page - share button"
              />
            </Button>
          </Link>
        </FlexBox>
      }
    />
  );
}
