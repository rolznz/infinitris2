import { Button, Link, Typography } from '@mui/material';
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
import { useUser } from '@/components/hooks/useUser';
import { Page } from '@/components/ui/Page';
import { getChallengeTestUrl } from '@/utils/getChallengeTestUrl';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import ChallengeCard from '@/components/pages/ChallengesPage/ChallengeCard';
import challengecreatorImage from '@components/ui/GameModePicker/assets/illustration_challengecreator.jpg';

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
    <FlexBox flexWrap="wrap" flexDirection="row" gap={4} pt={2} pb={4}>
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          onClick={() => {
            let editExisting =
              isAdmin && window.confirm('Edit existing challenge?');
            useChallengeEditorStore
              .getState()
              .setChallengeId(editExisting ? challenge.id : undefined);
            useChallengeEditorStore.getState().setChallenge({
              ...(editExisting ? ({} as IChallenge) : createNewChallenge()),
              grid: challenge.data()!.grid,
              title:
                !editExisting && challenge.data()?.isTemplate
                  ? undefined
                  : challenge.data()!.title,
              worldType: challenge.data()!.worldType,
              worldVariation: challenge.data()!.worldVariation,
              simulationSettings: challenge.data()!.simulationSettings,
              isTemplate:
                challenge.data()?.isTemplate && isAdmin && editExisting,
              isOfficial: Boolean(
                challenge.data()?.isOfficial && isAdmin && editExisting
              ),
              // TODO: add other writable settings here (linked with form options)
            });
            history.push(getChallengeTestUrl());
          }}
        />
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
      <img alt="" src={challengecreatorImage} height="300px" />
      <FlexBox my={2}>
        {challenge ? (
          <>
            <Typography align="center">
              <FormattedMessage
                defaultMessage="Resume Challenge"
                description="New Challenge Page - Resume challenge"
              />
            </Typography>
            <Link component={RouterLink} to={Routes.createChallenge}>
              <Button size="large" variant="contained">
                <FormattedMessage
                  defaultMessage="Resume"
                  description="Resume"
                />
              </Button>
            </Link>
          </>
        ) : (
          <Typography variant="body2" align="center">
            <FormattedMessage
              defaultMessage="Select one of the templates below to begin creating your challenge"
              description="New Challenge Page - Select a template to begin"
            />
          </Typography>
        )}
      </FlexBox>

      <Typography align="center" variant="h2">
        <FormattedMessage
          defaultMessage="Official Templates"
          description="Challenges Page - Official Templates"
        />
      </Typography>

      <ChallengesRow challenges={templateChallenges} />

      {userChallenges?.length && (
        <>
          <Typography align="center" variant="h2">
            <FormattedMessage
              defaultMessage="Your Published Challenges"
              description="Challenges Page - Your Published Challenges section title"
            />
          </Typography>
          <ChallengesRow challenges={userChallenges} />
        </>
      )}

      <Typography align="center" variant="h2">
        <FormattedMessage
          defaultMessage="Community Published Challenges"
          description="Challenges Page - Community Published Challenges section title"
        />
      </Typography>
      <ChallengesRow challenges={allChallenges} />
    </Page>
  );
}
