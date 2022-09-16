import FlexBox from '@/components/ui/FlexBox';
import React from 'react';
import { ChallengeEditorSettingsTab } from './tabs/ChallengeEditorSettingsTab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList/TabList';
import TabPanel from '@mui/lab/TabPanel/TabPanel';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import Tab from '@mui/material/Tab';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography/Typography';
import { useHistory } from 'react-router-dom';
import { getChallengeTestUrl } from '@/utils/getChallengeTestUrl';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';

type ChallengeEditorTab = 'info' | 'grid';

export function CreateChallengeHeader() {
  const [selectedTab, setSelectedTab] =
    React.useState<ChallengeEditorTab>('info');
  const history = useHistory();

  React.useEffect(() => {
    if (selectedTab === 'grid') {
      useChallengeEditorStore.getState().setIsEditing(false);
      history.push(getChallengeTestUrl());
    }
  }, [selectedTab, history]);

  const isLandscape = useIsLandscape();

  return (
    <TabContext value={selectedTab}>
      <>
        <FlexBox flexDirection="row" gap={4} mt={isLandscape ? 0 : 6}>
          <TabList
            onChange={(
              _event: React.SyntheticEvent,
              value: ChallengeEditorTab
            ) => {
              setSelectedTab(value);
            }}
            aria-label="challenge editor settings page tabs"
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
          </TabList>
        </FlexBox>
        <FlexBox pt={2} width="100%" height="100%" justifyContent="flex-start">
          <TabPanel value="info">
            <ChallengeEditorSettingsTab />
          </TabPanel>
        </FlexBox>
      </>
    </TabContext>
  );
}
