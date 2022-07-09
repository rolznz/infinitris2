import FlexBox from '@/components/ui/FlexBox';
import React from 'react';
import { ChallengeEditorSettingsTab } from './tabs/ChallengeEditorSettingsTab';
import { ChallengeEditorGridTab } from './tabs/ChallengeEditorGridTab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList/TabList';
import TabPanel from '@mui/lab/TabPanel/TabPanel';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import Tab from '@mui/material/Tab';
//import { ChallengeEditorJson } from './tabs/ChallengeEditorJson';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography/Typography';

type ChallengeEditorTab = 'info' | 'grid';

export function CreateChallengeHeader() {
  const [availableBlocksTab, setAvailableBlocksTab] =
    React.useState<ChallengeEditorTab>('info');

  const isLandscape = useIsLandscape();

  return (
    <TabContext value={availableBlocksTab}>
      <>
        <FlexBox flexDirection="row" gap={4} mt={isLandscape ? 0 : 6}>
          <TabList
            onChange={(
              _event: React.SyntheticEvent,
              value: ChallengeEditorTab
            ) => {
              setAvailableBlocksTab(value);
            }}
            aria-label="lab API tabs example"
          >
            <Tab
              label={
                <Typography variant="body1">
                  <FormattedMessage
                    defaultMessage="Settings"
                    description="Challenge Editor - settings tab"
                  />
                </Typography>
              }
              value="info"
            />
            <Tab
              label={
                <Typography variant="body1">
                  <FormattedMessage
                    defaultMessage="Editor"
                    description="Challenge Editor - grid tab"
                  />
                </Typography>
              }
              value="grid"
            />
            {/*<Tab
              label={<span style={{ fontSize: 14 }}>{'{}'}</span>}
              value="json"
            />*/}
          </TabList>
        </FlexBox>
        <FlexBox pt={2} width="100%" height="100%" justifyContent="flex-start">
          <TabPanel value="info">
            <ChallengeEditorSettingsTab />
          </TabPanel>
          <TabPanel value="grid">
            <ChallengeEditorGridTab />
          </TabPanel>
          {/*<TabPanel value="json" sx={{ height: '100%' }}>
            <ChallengeEditorJson />
          </TabPanel>*/}
        </FlexBox>
      </>
    </TabContext>
  );
}
