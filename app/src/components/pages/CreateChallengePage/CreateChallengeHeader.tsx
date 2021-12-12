import FlexBox from '@/components/ui/FlexBox';
import React from 'react';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FolderIcon from '@mui/icons-material/Folder';
import SaveIcon from '@mui/icons-material/Save';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab, Typography } from '@mui/material';
import Grid4x4Icon from '@mui/icons-material/Grid4x4';
import JavascriptIcon from '@mui/icons-material/Javascript';
import { ChallengeInfo } from './ChallengeInfo';
import ChallengeGridPreview from '../ChallengesPage/ChallengeGridPreview';

type ChallengeEditorTab = 'info' | 'grid' | 'json';

export function CreateChallengeHeader() {
  const [availableBlocksTab, setAvailableBlocksTab] =
    React.useState<ChallengeEditorTab>('info');
  /* <SaveIcon />
    <FolderIcon /> */

  return (
    <TabContext value={availableBlocksTab}>
      <>
        <FlexBox flexDirection="row" gap={4}>
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
              label={
                <Typography sx={{ fontSize: 10, textTransform: 'capitalize' }}>
                  JSON
                </Typography>
              }
              value="json"
            />
          </TabList>
        </FlexBox>
        <FlexBox pt={1}>
          <TabPanel value="info">
            <ChallengeInfo />
          </TabPanel>
          <TabPanel value="grid">
            Play / Edit
            <ChallengeGridPreview
              grid={`
XXX
000
XXX
          `}
            />
          </TabPanel>
          <TabPanel value="preview">
            <p>Hi2</p>
          </TabPanel>
        </FlexBox>
      </>
    </TabContext>
  );
}
