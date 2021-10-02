import { Box, SvgIcon, Typography } from '@material-ui/core';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import FlexBox from '../../ui/FlexBox';
import { Page } from '../../ui/Page';
import coneFace from './assets/faces/cone.png';
import athleteFace from './assets/faces/athlete.png';
import chillFace from './assets/faces/chill.png';
import LinkIcon from '@material-ui/icons/Link';
import { RingIconButton } from '@/components/ui/RingIconButton';

type PrimaryContributorProps = {
  name: string;
  role: string;
  image: string;
  url: string;
};

function PrimaryContributor({
  name,
  role,
  image,
  url,
}: PrimaryContributorProps) {
  return (
    <FlexBox>
      <Typography variant="h5" style={{ fontWeight: 600 }} align="center">
        {role}
      </Typography>
      <Box mt={4} />
      <FlexBox
        flexDirection="row"
        gridGap={30}
        width={375}
        maxWidth="100%"
        justifyContent="flex-start"
      >
        <img
          src={image}
          alt="character"
          style={{
            width: 'auto',
            height: '200px',
          }}
        />
        <FlexBox alignItems="flex-start">
          <Typography variant="h4">{name}</Typography>
          <Box mt={2} />
          <a href={url}>
            <RingIconButton>
              <SvgIcon color="primary">
                <LinkIcon />
              </SvgIcon>
            </RingIconButton>
          </a>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
}

export function CreditsPage() {
  return (
    <Page
      title={
        <FormattedMessage
          defaultMessage="Credits"
          description="Credits Header"
        />
      }
      narrow
    >
      <FlexBox gridGap={100}>
        <PrimaryContributor
          image={coneFace}
          name="Roland B"
          role="Direction & Programming"
          url="https://github.com/rolznz/infinitris2"
        />
        <PrimaryContributor
          image={athleteFace}
          name="Rebecca B"
          role="Art & UX design"
          url="https://rebeccabewick.com"
        />
        <PrimaryContributor
          image={chillFace}
          name="Allan Z"
          role="Soundtrack"
          url="https://www.youtube.com/channel/UCzURFiRW3N2hoJupZ4AEGMg"
        />
      </FlexBox>
      <Box mt={10} />
      <Typography variant="h4">Special Thanks</Typography>
      <Box mt={2} />
      <Typography variant="body1" align="center">
        AL Kong, Rob Hayes, Zorg, Sven Obermaier, Natalia Golovacheva, Jono
        Burch, Charles Liu, Nick van der Vis, Seth Reid, Eugene van Staden,
        Linda Pettigrew, Niamh Fitzgerald, Tim Bewick, Michał Marcinkowski,
        Saintpoida, Jonathan Derrough
      </Typography>

      <Box mt={10} />
      <Typography variant="body1">
        Gestures by Jeff Portaro from&nbsp;
        <a
          href="https://www.flaticon.com/authors/pixel-buddha"
          title="Pixel Buddha"
        >
          Pixel Buddha
        </a>
      </Typography>
    </Page>
  );
}
