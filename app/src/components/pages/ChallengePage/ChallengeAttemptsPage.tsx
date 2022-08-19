import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import { ChallengeTopAttempt } from '@/components/pages/ChallengePage/ChallengeTopAttempts';
import { getOfficialChallengeTitle } from '@/components/pages/StoryModePage/StoryModePage';
import { InfiniteLoader } from '@/components/ui/InfiniteLoader';
import { Page } from '@/components/ui/Page';
import useAuthStore from '@/state/AuthStore';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import {
  where,
  orderBy,
  QueryDocumentSnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import {
  verifyProperty,
  IChallengeAttempt,
  challengeAttemptsPath,
  WithId,
  getChallengePath,
  IChallenge,
} from 'infinitris2-models';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import useWindowSize from 'react-use/lib/useWindowSize';
import { UseCollectionOptions, useDocument } from 'swr-firestore';

interface ChallengeAttemptsPageRouteParams {
  id: string;
}

export function ChallengeAttemptsPage() {
  const intl = useIntl();
  const { id: challengeId } = useParams<ChallengeAttemptsPageRouteParams>();
  const [showOnlyTopPlayerAttempts, setShowOnlyTopPlayerAttempts] =
    React.useState(false);
  const toggleShowOnlyTopPlayerAttempts = React.useCallback(() => {
    setShowOnlyTopPlayerAttempts(
      (showOnlyTopPlayerAttempts) => !showOnlyTopPlayerAttempts
    );
  }, []);
  const { data: challengeDoc } = useDocument<IChallenge>(
    getChallengePath(challengeId)
  );
  const userId = useAuthStore((store) => store.user?.uid);
  if (!challengeDoc) {
    return null;
  }
  const challenge = challengeDoc.data()!;

  const challengeTitle = challenge.isOfficial
    ? getOfficialChallengeTitle(challenge)
    : challenge.title || 'Untitled';

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Challenge Top Plays',
        description: 'Challenge Attempts Page title',
      })}
    >
      <Typography variant="h2">{challengeTitle}</Typography>
      <FormControlLabel
        control={
          <Checkbox
            color="primary"
            checked={showOnlyTopPlayerAttempts}
            onChange={() => {
              toggleShowOnlyTopPlayerAttempts();
            }}
            // checkedIcon={<CheckCircleIcon />}
            // icon={<RadioButtonUncheckedIcon />}
            //className={classes.checkbox}
          />
        }
        label={intl.formatMessage({
          defaultMessage: 'Player PBs Only',
          description: 'Challenge Top Attempts - Show Player Top Attempts',
        })}
      />
      {!userId && (
        <Typography variant="caption" textAlign="center" my={1}>
          <FormattedMessage
            defaultMessage="Get Infinitris Premium to appear here"
            description="Top challenge attempts"
          />
        </Typography>
      )}
      {[true, false].map(
        (showOnlyTopPlayerAttemptsTab) =>
          showOnlyTopPlayerAttempts === showOnlyTopPlayerAttemptsTab && (
            <ChallengeAttemptsTab
              challengeId={challengeId}
              filterType={showOnlyTopPlayerAttemptsTab ? 'pbsOnly' : 'all'}
            />
          )
      )}
    </Page>
  );
}

// TODO: add myAttempts option to show only the current player's best
export type ChallengeAttemptsFilterType = 'all' | 'pbsOnly';

const resetCachedChallengeAttempts = () => ({
  all: [],
  pbsOnly: [],
});

let cachedChallengeAttempts: Record<
  ChallengeAttemptsFilterType,
  QueryDocumentSnapshot<IChallengeAttempt>[]
> = resetCachedChallengeAttempts();
let cachedChallengeId: string;

type ChallengeAttemptsTabProps = {
  challengeId: string;
  filterType: ChallengeAttemptsFilterType;
};
function ChallengeAttemptsTab({
  challengeId,
  filterType,
}: ChallengeAttemptsTabProps) {
  if (cachedChallengeId !== challengeId) {
    cachedChallengeAttempts = resetCachedChallengeAttempts();
    cachedChallengeId = challengeId;
  }
  const [challengeAttempts, setChallengeAttempts] = React.useState<
    QueryDocumentSnapshot<IChallengeAttempt>[]
  >(cachedChallengeAttempts[filterType]);

  // TODO: remove listen param and wait for challenge to be created before navigating

  const useCollectionOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where(
          verifyProperty<IChallengeAttempt>('challengeId'),
          '==',
          challengeId
        ),
        ...(filterType === 'pbsOnly'
          ? [
              where(
                verifyProperty<IChallengeAttempt>(
                  'readOnly.isPlayerTopAttempt'
                ),
                '==',
                true
              ),
            ]
          : []),
        orderBy('stats.timeTakenMs', 'asc'),
      ],
      listen: true,
    }),
    [challengeId, filterType]
  );

  const onNewItemsLoaded = React.useCallback(
    (newItems: QueryDocumentSnapshot<IChallengeAttempt>[]) => {
      cachedChallengeAttempts[filterType] =
        cachedChallengeAttempts[filterType].concat(newItems);
      setChallengeAttempts(cachedChallengeAttempts[filterType]);
      console.log(
        'Loaded',
        cachedChallengeAttempts[filterType].length,
        'challenges'
      );
    },
    [filterType]
  );

  const renderItem = React.useCallback<
    (
      attempt: DocumentSnapshot<IChallengeAttempt>,
      index: number
    ) => React.ReactNode
  >(
    (attempt, index) => {
      const attemptWithId: WithId<IChallengeAttempt> = {
        id: attempt.id,
        ...attempt.data()!,
      };
      return (
        <ChallengeTopAttempt
          attempt={attemptWithId}
          placing={index + 1}
          challengeId={challengeId}
          key={attempt.id}
          showPlayerName
        />
      );
    },
    [challengeId]
  );

  const isLandscape = useIsLandscape();
  const windowSize = useWindowSize();
  const gap = isLandscape ? 4 : 2;

  return (
    <InfiniteLoader<IChallengeAttempt>
      items={challengeAttempts}
      onNewItemsLoaded={onNewItemsLoaded}
      renderItem={renderItem}
      itemWidth={130}
      itemHeight={150}
      numColumns={
        isLandscape ? Math.floor(windowSize.width / (200 + gap * 2)) : 2
      }
      gap={gap}
      collectionPath={challengeAttemptsPath}
      useCollectionOptions={useCollectionOptions}
      justifyContent="center"
    />
  );
}
