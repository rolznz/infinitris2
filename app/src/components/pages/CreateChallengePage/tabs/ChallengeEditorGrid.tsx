import FlexBox from '@/components/ui/FlexBox';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import Button from '@mui/material/Button';
import { parseGrid } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import useWindowSize from 'react-use/lib/useWindowSize';
import ChallengeGridPreview, {
  FittedChallengeGridPreview,
} from '../../ChallengesPage/ChallengeGridPreview';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Routes from '@/models/Routes';
import stableStringify from '@/utils/stableStringify';

export function ChallengeEditorGrid() {
  const windowSize = useWindowSize();
  const challenge = useChallengeEditorStore((store) => store.challenge);
  if (!challenge) {
    return null;
  }

  return (
    <FlexBox width="100%" justifyContent="flex-start">
      <Link
        component={RouterLink}
        underline="none"
        to={`${Routes.challenges}/test?json=${encodeURIComponent(
          stableStringify(challenge)
        )}`}
        mb={1}
      >
        <Button color="primary" variant="contained" size="large">
          <FormattedMessage
            defaultMessage="Play" //Play / Edit
            description="Challenge Editor Grid - Play/Edit"
          />
        </Button>
      </Link>

      <FittedChallengeGridPreview
        grid={challenge.grid}
        maxWidth={windowSize.width * 0.8}
        maxHeight={windowSize.height * 0.6}
      />
    </FlexBox>
  );
}
