import { Button, Card, Link, Typography } from '@mui/material';
import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import useAuthStore from '../../../state/AuthStore';

import FlexBox from '../../ui/FlexBox';
import { DocumentSnapshot, where } from 'firebase/firestore';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import { createNewChallenge } from '@/components/pages/CreateChallengePage/createNewChallenge';
import { ChallengeGridPartialPreview } from '@/components/pages/ChallengesPage/ChallengeGridPartialPreview';
import { useUser } from '@/components/hooks/useUser';
import { Page } from '@/components/ui/Page';
import { getChallengeTestUrl } from '@/utils/getChallengeTestUrl';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';

interface ChallengesRowProps {
  challenges: DocumentSnapshot<IChallenge>[] | undefined;
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
                title: challenge.data()?.isTemplate
                  ? undefined
                  : challenge.data()!.title,
                worldType: challenge.data()!.worldType,
                worldVariation: challenge.data()!.worldVariation,
                simulationSettings: challenge.data()!.simulationSettings,
                // TODO: add other writable settings here (linked with form options)
              });
              history.push(
                getChallengeTestUrl(
                  useChallengeEditorStore.getState().challenge!
                )
              );
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

const templateChallengesFilter: UseCollectionOptions = {
  constraints: [where('isTemplate', '==', true)],
};

const allChallengesFilter: UseCollectionOptions = {
  constraints: [where('isOfficial', '==', false)],
};

export function LoadChallengePage() {
  const userId = useAuthStore().user?.uid;
  const challenge = useChallengeEditorStore((store) => store.challenge);
  const useUserChallengesOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [where('userId', '==', userId)],
    }),
    [userId]
  );

  const { data: userChallenges } = useCollection<IChallenge>(
    userId ? challengesPath : null,
    useUserChallengesOptions
  );
  const { data: allChallenges } = useCollection<IChallenge>(
    challengesPath,
    allChallengesFilter
  );
  const { data: templateChallenges } = useCollection<IChallenge>(
    challengesPath,
    templateChallengesFilter
  );
  const intl = useIntl();

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'New Challenge',
        description: 'New Challenge page title',
      })}
    >
      {challenge && (
        <FlexBox mb={4}>
          <Typography align="center">
            <FormattedMessage
              defaultMessage="Resume Challenge"
              description="Challenges Page - Resume challenge"
            />
          </Typography>
          <Link component={RouterLink} to={Routes.createChallenge}>
            <Button size="large" variant="contained">
              <FormattedMessage defaultMessage="Resume" description="Resume" />
            </Button>
          </Link>
        </FlexBox>
      )}

      <Typography align="center">
        <FormattedMessage
          defaultMessage="Official Templates"
          description="Challenges Page - Official Templates"
        />
      </Typography>

      <ChallengesRow challenges={templateChallenges} />

      {userChallenges?.length && (
        <>
          {' '}
          <Typography align="center">
            <FormattedMessage
              defaultMessage="Your Published Challenges"
              description="Challenges Page - Your Published Challenges section title"
            />
          </Typography>
          <ChallengesRow challenges={userChallenges} />
        </>
      )}

      <Typography align="center">
        <FormattedMessage
          defaultMessage="Community Published Challenges"
          description="Challenges Page - Community Published Challenges section title"
        />
      </Typography>
      <ChallengesRow challenges={allChallenges} />
    </Page>
  );
}
