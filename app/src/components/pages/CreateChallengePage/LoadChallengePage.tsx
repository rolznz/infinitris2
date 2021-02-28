import { Card, Typography } from '@material-ui/core';
import { useCollection } from '@nandorojo/swr-firestore';
import { IChallenge } from 'infinitris2-models';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { challengesPath } from '../../../firebase';
import Routes from '../../../models/Routes';
import localStorageKeys from '../../../utils/localStorageKeys';
import prettyStringify from '../../../utils/prettyStringify';

import FlexBox from '../../layout/FlexBox';
import LoadingSpinner from '../../LoadingSpinner';
import ChallengeGridPreview from '../ChallengesPage/ChallengeGridPreview';

export function LoadChallengePage() {
  const { data: challenges } = useCollection<IChallenge>(challengesPath);
  const history = useHistory();

  if (!challenges) {
    return <LoadingSpinner />;
  }

  return (
    <FlexBox flex={1} padding={10} flexWrap="wrap" flexDirection="row">
      {challenges.map((challenge) => (
        <FlexBox key={challenge.id} margin={4}>
          <Card
            onClick={() => {
              const { grid, ...challengeInfo } = challenge;
              localStorage.setItem(
                localStorageKeys.createChallengeGrid,
                grid as string
              );
              localStorage.setItem(
                localStorageKeys.createChallengeInfo,
                prettyStringify(challengeInfo)
              );
              history.push(Routes.createChallenge);
            }}
          >
            <Typography>{challenge.title}</Typography>
            <ChallengeGridPreview grid={challenge.grid || '0'} />
          </Card>
        </FlexBox>
      ))}
    </FlexBox>
  );
}
