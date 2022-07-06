import { Card, Typography } from '@mui/material';
import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';
import useAuthStore from '../../../state/AuthStore';

import FlexBox from '../../ui/FlexBox';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { DocumentSnapshot, where } from 'firebase/firestore';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import { createNewChallenge } from '@/components/pages/CreateChallengePage/createNewChallenge';
import { ChallengeGridPartialPreview } from '@/components/pages/ChallengesPage/ChallengeGridPartialPreview';
import { useUser } from '@/components/hooks/useUser';

interface ChallengesRowProps {
  challenges: DocumentSnapshot<IChallenge>[] | null | undefined;
}

function ChallengesRow({ challenges }: ChallengesRowProps) {
  const history = useHistory();
  const user = useUser();
  if (!challenges) {
    return null;
  }
  const isAdmin = user.readOnly?.isAdmin;
  return (
    <FlexBox flex={1} padding={4} flexWrap="wrap" flexDirection="row">
      {challenges.map((challenge) => (
        <FlexBox key={challenge.id} margin={4}>
          <Card
            onClick={() => {
              let editExisting =
                isAdmin && window.confirm('Edit existing challenge?');
              useChallengeEditorStore
                .getState()
                .setChallengeId(editExisting ? challenge.id : undefined);
              useChallengeEditorStore.getState().setChallenge({
                ...(editExisting ? ({} as IChallenge) : createNewChallenge()),
                grid: challenge.data()!.grid,
                title: challenge.data()!.title,
                worldType: challenge.data()!.worldType,
                worldVariation: challenge.data()!.worldVariation,
                simulationSettings: challenge.data()!.simulationSettings,
                // TODO: add other writable settings here (linked with form options)
              });
              history.push(Routes.createChallenge);
            }}
          >
            <Typography>{challenge.data()!.title}</Typography>
            <ChallengeGridPartialPreview
              grid={challenge.data()!.grid}
              allRows
            />
          </Card>
        </FlexBox>
      ))}
    </FlexBox>
  );
}

export function LoadChallengePage() {
  const userId = useAuthStore().user?.uid;
  if (!userId) {
    return null;
  }
  return <LoadChallengePageInternal userId={userId} />;
}

type LoadChallengePageInternalProps = {
  userId: string;
};

function LoadChallengePageInternal({ userId }: LoadChallengePageInternalProps) {
  const useUserChallengesOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [where('userId', '==', userId)],
    }),
    [userId]
  );

  const { data: userChallenges } = useCollection<IChallenge>(
    challengesPath,
    useUserChallengesOptions
  );
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
