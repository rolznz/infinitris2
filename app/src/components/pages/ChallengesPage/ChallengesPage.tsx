import { challenges } from 'infinitris2-models';
import React from 'react';

import FlexBox from '../../layout/FlexBox';
import ChallengeCard from './ChallengeCard';

export function ChallengesPage() {
  return (
    <FlexBox flex={1} padding={10} flexWrap="wrap" flexDirection="row">
      {challenges
        .filter((challenge) => challenge.isPublished)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .map((challenge) => (
          <FlexBox key={challenge.id} margin={4}>
            <ChallengeCard challenge={challenge} />
          </FlexBox>
        ))}
    </FlexBox>
  );
}