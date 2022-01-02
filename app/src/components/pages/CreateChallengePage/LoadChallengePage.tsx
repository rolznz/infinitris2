import { Card, Typography } from '@mui/material';
import { useCollection } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';
import useAuthStore from '../../../state/AuthStore';
import localStorageKeys from '../../../utils/localStorageKeys';
import prettyStringify from '../../../utils/prettyStringify';

import FlexBox from '../../ui/FlexBox';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ChallengeGridPreview from '../ChallengesPage/ChallengeGridPreview';
import { DocumentSnapshot, where } from 'firebase/firestore';

interface ChallengesRowProps {
  challenges: DocumentSnapshot<IChallenge>[] | null | undefined;
}

function ChallengesRow({ challenges }: ChallengesRowProps) {
  const history = useHistory();
  if (!challenges) {
    return null;
  }

  return (
    <FlexBox flex={1} padding={4} flexWrap="wrap" flexDirection="row">
      {challenges.map((challenge) => (
        <FlexBox key={challenge.id} margin={4}>
          <Card
            onClick={() => {
              // FIXME: load challenge
              history.push(Routes.createChallenge);
            }}
          >
            <Typography>{challenge.data()!.title}</Typography>
            <ChallengeGridPreview
              grid={challenge.data()!.grid || '0'}
              width={100}
              height={100}
            />
          </Card>
        </FlexBox>
      ))}
    </FlexBox>
  );
}

export function LoadChallengePage() {
  const userId = useAuthStore().user?.uid;

  const { data: userChallenges } = useCollection<IChallenge>(challengesPath, {
    constraints: [where('userId', '==', userId)],
  });
  const { data: challenges } = useCollection<IChallenge>(challengesPath);

  if (!challenges) {
    return (
      <FlexBox flex={1}>
        <LoadingSpinner />
      </FlexBox>
    );
  }

  return (
    <FlexBox>
      <Typography align="center">
        <FormattedMessage
          defaultMessage="Your Challenges"
          description="Challenges Page - Your Challenges section title"
        />
      </Typography>

      <ChallengesRow challenges={userChallenges} />

      <Typography align="center">
        <FormattedMessage
          defaultMessage="All Challenges"
          description="Challenges Page - All Challenges section title"
        />
      </Typography>
      <ChallengesRow challenges={challenges} />
    </FlexBox>
  );
}
