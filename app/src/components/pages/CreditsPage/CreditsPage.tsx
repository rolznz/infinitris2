import { Box, Link, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FlexBox from '../../ui/FlexBox';
import { Page } from '../../ui/Page';
import coneFace from './assets/faces/cone.png';
import athleteFace from './assets/faces/athlete.png';
import chillFace from './assets/faces/chill.png';
import GlobeIcon from '@mui/icons-material/Public';
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
        gap={3}
        width={375}
        maxWidth="100%"
        justifyContent="flex-start"
      >
        <img
          src={image}
          alt="character"
          style={{
            height: 'auto',
            width: '200px',
          }}
        />
        <FlexBox alignItems="flex-start">
          <Typography variant="h4">{name}</Typography>
          <Box mt={2} />
          <Link href={url}>
            <RingIconButton>
              <SvgIcon color="primary">
                <GlobeIcon />
              </SvgIcon>
            </RingIconButton>
          </Link>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
}

export function CreditsPage() {
  const intl = useIntl();
  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Credits',
        description: 'Credits page title',
      })}
      narrow
    >
      <Box mt={4} />
      <FlexBox gap={10}>
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
        Linda Pettigrew, Mitchel Roy, Niamh Fitzgerald, Tim Bewick, Michał
        Marcinkowski, Saintpoida, Jonathan Derrough, Andy Brennenstuhl, Bruno
        Finger, Aaike Van Roekeghem, Tae Kasidit
      </Typography>

      <Box mt={10} />
      <Typography variant="body1">
        Gestures by Jeff Portaro from&nbsp;
        <Link
          href="https://www.flaticon.com/authors/pixel-buddha"
          title="Pixel Buddha"
        >
          Pixel Buddha
        </Link>
      </Typography>
      <Box mt={10} />
      <Typography variant="body1">
        Flags by&nbsp;
        <Link href="https://flagcdn.com" title="Flag CDN">
          Flag CDN
        </Link>
      </Typography>
    </Page>
  );
}
