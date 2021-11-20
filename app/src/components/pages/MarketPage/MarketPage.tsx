import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Page } from '../../ui/Page';
import marketImage from './assets/market.png';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  makeStyles,
  SvgIcon,
  Typography,
} from '@material-ui/core';
import { MarketPageCharacterList } from './MarketPageCharacterList';
import { ReactComponent as MarketIcon } from '@/icons/market.svg';
import { ReactComponent as MyBlocksIcon } from '@/icons/my-blocks.svg';
import { borderColor } from '@/theme';
import { FilledIcon } from '@/components/ui/FilledIcon';

function _MarketPage() {
  const intl = useIntl();

  const [myBlocksExpanded, setMyBlocksExpanded] = React.useState(true);
  const [availableBlocksExpanded, setAvailableBlocksExpanded] =
    React.useState(true);

  return (
    <Page
      useGradient
      paddingX={0}
      title={intl.formatMessage({
        defaultMessage: 'Market',
        description: 'Market page title',
      })}
      titleImage={
        <img
          src={marketImage}
          width="100%"
          style={{
            maxWidth: '562px',
            maxHeight: '50vh',
            objectFit: 'contain',
          }}
          alt=""
        />
      }
    >
      <Accordion
        expanded={myBlocksExpanded}
        onChange={(_, expanded) => setMyBlocksExpanded(expanded)}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <FilledIcon>
            <MyBlocksIcon />
          </FilledIcon>
          <Typography>
            <FormattedMessage
              defaultMessage="My Blocks"
              description="Market Page - My blocks accordion header"
            />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <MarketPageCharacterList filter="my-blocks" />
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={availableBlocksExpanded}
        onChange={(_, expanded) => setAvailableBlocksExpanded(expanded)}
      >
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <FilledIcon>
            <MarketIcon />
          </FilledIcon>
          <Typography>
            <FormattedMessage
              defaultMessage="Available Blocks"
              description="Market Page - Available blocks accordion header"
            />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <MarketPageCharacterList filter="available" />
        </AccordionDetails>
      </Accordion>
    </Page>
  );
}

const MarketPage = React.memo(_MarketPage);
export default MarketPage;
