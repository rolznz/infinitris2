import FlexBox from '@/components/ui/FlexBox';
import React from 'react';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import Grid4x4Icon from '@mui/icons-material/Grid4x4';
import { ChallengeEditorInfo } from './tabs/ChallengeEditorInfo';
import { ChallengeEditorGrid } from './tabs/ChallengeEditorGrid';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList/TabList';
import TabPanel from '@mui/lab/TabPanel/TabPanel';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import Tab from '@mui/material/Tab';
import { ChallengeEditorJson } from './tabs/ChallengeEditorJson';

type ChallengeEditorTab = 'info' | 'grid' | 'json';

export function CreateChallengeHeader() {
  const [availableBlocksTab, setAvailableBlocksTab] =
    React.useState<ChallengeEditorTab>('grid');

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
            <Tab label={<FormatAlignLeftIcon />} value="info" />
            <Tab label={<Grid4x4Icon />} value="grid" />
            <Tab
              label={<span style={{ fontSize: 14 }}>{'{}'}</span>}
              value="json"
            />
          </TabList>
        </FlexBox>
        <FlexBox pt={2} width="100%" height="100%" justifyContent="flex-start">
          <TabPanel value="info">
            <ChallengeEditorInfo />
          </TabPanel>
          <TabPanel value="grid">
            <ChallengeEditorGrid />
          </TabPanel>
          <TabPanel value="json" sx={{ height: '100%' }}>
            <ChallengeEditorJson />
          </TabPanel>
        </FlexBox>
      </>
    </TabContext>
  );
}
