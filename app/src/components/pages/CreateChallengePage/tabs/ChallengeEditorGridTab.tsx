import FlexBox from '@/components/ui/FlexBox';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import Button from '@mui/material/Button';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import useWindowSize from 'react-use/lib/useWindowSize';
import { FittedChallengeGridPreview } from '../../ChallengesPage/ChallengeGridPreview';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Routes from '@/models/Routes';
import stableStringify from '@/utils/stableStringify';
import { boxShadows } from '@/theme/theme';

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
          <FittedChallengeGridPreview
            grid={challenge.grid}
            maxWidth={windowSize.width * 0.9}
            maxHeight={windowSize.height * 0.8}
          />
        </FlexBox>
        <FlexBox position="absolute">
          <Link
            component={RouterLink}
            underline="none"
            to={`${Routes.challenges}/test?json=${encodeURIComponent(
              stableStringify(challenge)
            )}`}
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
