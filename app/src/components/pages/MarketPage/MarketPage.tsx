import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Page } from '../../ui/Page';
import marketImage from './assets/market.png';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  makeStyles,
  SvgIcon,
  Tab,
  Typography,
} from '@material-ui/core';
import {
  MarketPageCharacterList,
  MarketPageCharacterListFilter,
} from './MarketPageCharacterList';
import { ReactComponent as MarketIcon } from '@/icons/market.svg';
import { ReactComponent as MyBlocksIcon } from '@/icons/my-blocks.svg';
import { FilledIcon } from '@/components/ui/FilledIcon';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import FlexBox from '@/components/ui/FlexBox';

// TODO: use zustand
let lastSelectedTab: MarketPageCharacterListFilter = 'available-all';

function _MarketPage() {
  const intl = useIntl();

  const [availableBlocksTab, setAvailableBlocksTab] =
    React.useState<MarketPageCharacterListFilter>(lastSelectedTab);
  const [myBlocksExpanded, setMyBlocksExpanded] = React.useState(true);
  const [availableBlocksExpanded, setAvailableBlocksExpanded] =
    React.useState(true);

  console.log('Re-render market page');

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
          <Typography variant="h6">
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
          <Typography variant="h6">
            <FormattedMessage
              defaultMessage="Available Blocks"
              description="Market Page - Available blocks accordion header"
            />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TabContext value={availableBlocksTab}>
            <FlexBox alignItems="flex-start">
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList
                  onChange={(
                    _event: React.SyntheticEvent,
                    value: MarketPageCharacterListFilter
                  ) => {
                    setAvailableBlocksTab(value);
                    lastSelectedTab = value;
                  }}
                  aria-label="lab API tabs example"
                >
                  <Tab label="All" value="available-all" />
                  <Tab
                    label="Cheap"
                    value="available-free" /* TODO: Change back to Free */
                  />
                  <Tab label="Premium" value="available-premium" />
                </TabList>
              </Box>
              <TabPanel value="available-all">
                <MarketPageCharacterList filter="available-all" />
              </TabPanel>
              <TabPanel value="available-free">
                <MarketPageCharacterList filter="available-free" />
              </TabPanel>
              <TabPanel value="available-premium">
                <MarketPageCharacterList filter="available-premium" />
              </TabPanel>
            </FlexBox>
          </TabContext>
        </AccordionDetails>
      </Accordion>
    </Page>
  );
}

const MarketPage = React.memo(_MarketPage);
export default MarketPage;
