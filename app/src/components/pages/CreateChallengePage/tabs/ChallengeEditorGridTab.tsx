import FlexBox from '@/components/ui/FlexBox';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import Button from '@mui/material/Button';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import useWindowSize from 'react-use/lib/useWindowSize';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import { boxShadows } from '@/theme/theme';
import { getChallengeTestUrl } from '@/utils/getChallengeTestUrl';
import { ChallengeGridPartialPreview } from '@/components/pages/ChallengesPage/ChallengeGridPartialPreview';

export function ChallengeEditorGridTab() {
  const windowSize = useWindowSize();
  const challenge = useChallengeEditorStore((store) => store.challenge);
  if (!challenge) {
    return null;
  }

  return (
    <FlexBox width="100%" justifyContent="flex-start">
      <FlexBox>
        <FlexBox sx={{ opacity: 0.6 }}>
          <ChallengeGridPartialPreview
            grid={challenge.grid}
            width={windowSize.width * 0.8}
            aspectRatio={windowSize.width / windowSize.height}
          />
        </FlexBox>
        <FlexBox position="absolute">
          <Link
            component={RouterLink}
            underline="none"
            to={getChallengeTestUrl()}
            mb={1}
            onClick={() => {
              useChallengeEditorStore.getState().setIsEditing(false);
            }}
          >
            <Button
              color="primary"
              variant="contained"
              size="large"
              sx={{ boxShadow: boxShadows.small }}
            >
              <FormattedMessage
                defaultMessage="Play / Edit"
                description="Challenge Editor Grid - Play/Edit"
              />
            </Button>
          </Link>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
}
