import { Card, Typography } from '@material-ui/core';
import { useCollection } from '@nandorojo/swr-firestore';
import { ITutorial } from 'infinitris2-models';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { challengesPath } from '../../../firebase';
import Routes from '../../../models/Routes';
import localStorageKeys from '../../../utils/localStorageKeys';
import prettyStringify from '../../../utils/prettyStringify';

import FlexBox from '../../layout/FlexBox';
import LoadingSpinner from '../../LoadingSpinner';
import TutorialGridPreview from '../TutorialsPage/TutorialGridPreview';

export function LoadChallengePage() {
  const { data: challenges } = useCollection<ITutorial>(challengesPath);
  const history = useHistory();

  if (!challenges) {
    return <LoadingSpinner />;
  }

  return (
    <FlexBox flex={1} padding={10} flexWrap="wrap" flexDirection="row">
      {challenges.map((tutorial) => (
        <FlexBox key={tutorial.id} margin={4}>
          <Card
            onClick={() => {
              const { grid, ...challengeInfo } = tutorial;
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
            <Typography>{tutorial.title}</Typography>
            <TutorialGridPreview grid={tutorial.grid || '0'} />
          </Card>
        </FlexBox>
      ))}
    </FlexBox>
  );
}
