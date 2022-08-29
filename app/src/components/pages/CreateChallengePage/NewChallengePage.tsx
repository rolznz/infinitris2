import { UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge, verifyProperty } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import useAuthStore from '../../../state/AuthStore';

import FlexBox from '../../ui/FlexBox';
import {
  DocumentSnapshot,
  QueryDocumentSnapshot,
  where,
} from 'firebase/firestore';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import { createNewChallenge } from '@/components/pages/CreateChallengePage/createNewChallenge';
import { useUser } from '@/components/hooks/useUser';
import { Page } from '@/components/ui/Page';
import { getChallengeTestUrl } from '@/utils/getChallengeTestUrl';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import ChallengeCard, {
  challengeCardHeight,
  challengeCardWidth,
} from '@/components/pages/ChallengesPage/ChallengeCard';
import challengecreatorImage from '@components/ui/GameModePicker/assets/illustration_challengecreator.jpg';
import TabList from '@mui/lab/TabList';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { InfiniteLoader } from '@/components/ui/InfiniteLoader';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import useWindowSize from 'react-use/lib/useWindowSize';
import TextField from '@mui/material/TextField';
import { debounce } from 'ts-debounce';

export const NewChallengePageTabValues = [
  'templates',
  'your-challenges',
  'community-challenges',
  'search',
] as const;
export type NewChallengePageTab = typeof NewChallengePageTabValues[number];

interface ChallengesRowProps {
  tab: NewChallengePageTab;
  searchQuery: string;
}

const cachedChallenges: Record<
  NewChallengePageTab,
  QueryDocumentSnapshot<IChallenge>[]
> = {
  templates: [],
  'your-challenges': [],
  'community-challenges': [],
  search: [],
};

const templatesFilter: UseCollectionOptions = {
  constraints: [
    where(verifyProperty<IChallenge>('isTemplate'), '==', true),
    // orderBy('readOnly.createdTimestamp', 'desc'),
  ],
};

const communityChallengesFilter: UseCollectionOptions = {
  constraints: [where(verifyProperty<IChallenge>('isOfficial'), '==', false)],
};

function ChallengesList({ tab, searchQuery }: ChallengesRowProps) {
  const history = useHistory();
  const user = useUser();

  const userId = useAuthStore((store) => store.user?.uid);

  const userChallengesFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [where(verifyProperty<IChallenge>('userId'), '==', userId)],
    }),
    [userId]
  );
  const searchChallengesFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where(verifyProperty<IChallenge>('title'), '>=', searchQuery),
        where(
          verifyProperty<IChallenge>('title'),
          '<=',
          searchQuery + '\uf8ff'
        ),
      ],
    }),
    [searchQuery]
  );

  const [challenges, setChallenges] = React.useState<
    QueryDocumentSnapshot<IChallenge>[]
  >(cachedChallenges[tab]);

  React.useEffect(() => {
    if (tab === 'search') {
      // reset challenges when search query changes
      setChallenges([]);
    }
  }, [tab, searchQuery]);

  const onNewItemsLoaded = React.useCallback(
    (newItems: QueryDocumentSnapshot<IChallenge>[]) => {
      cachedChallenges[tab] = cachedChallenges[tab].concat(newItems);
      setChallenges(cachedChallenges[tab]);
      console.log('Loaded', cachedChallenges[tab].length, 'challenges');
    },
    [tab]
  );

  const isAdmin = user.readOnly?.isAdmin;

  const renderItem = React.useCallback<
    (challenge: DocumentSnapshot<IChallenge>) => React.ReactNode
  >(
    (challenge) => {
      return (
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
      );
    },
    [history, isAdmin]
  );

  const isLandscape = useIsLandscape();
  const windowSize = useWindowSize();
  const gap = isLandscape ? 4 : 2;

  return (
    <InfiniteLoader<IChallenge>
      items={challenges}
      onNewItemsLoaded={onNewItemsLoaded}
      renderItem={renderItem}
      itemWidth={challengeCardWidth}
      itemHeight={challengeCardHeight}
      numColumns={
        isLandscape ? Math.floor(windowSize.width / (200 + gap * 2)) : 2
      }
      gap={gap}
      collectionPath={challengesPath}
      useCollectionOptions={
        tab === 'templates'
          ? templatesFilter
          : tab === 'community-challenges'
          ? communityChallengesFilter
          : tab === 'search'
          ? searchChallengesFilter
          : userChallengesFilter
      }
      justifyContent="center"
    />
  );
}

export function LoadChallengePage() {
  const challenge = useChallengeEditorStore((store) => store.challenge);
  const userId = useAuthStore((store) => store.user?.uid);

  const [selectedChallengesTab, setSelectedChallengesTab] =
    React.useState<NewChallengePageTab>('templates');

  const intl = useIntl();
  const [searchQuery, setSearchQuery] = React.useState('');
  const updateSearchQuery = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      cachedChallenges['search'] = [];
      setSearchQuery(event.target.value);
    },
    []
  );
  const debouncedUpdateSearchQuery = React.useMemo(
    () => debounce(updateSearchQuery, 500),
    [updateSearchQuery]
  );

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'New Challenge',
        description: 'New Challenge page title',
      })}
    >
      <img alt="" src={challengecreatorImage} height="300px" />
      <FlexBox my={2}>
        {challenge && (
          <>
            <Typography align="center" variant="body2" mb={1}>
              <FormattedMessage
                defaultMessage="You seem to have a challenge in progress."
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
        )}
      </FlexBox>

      <TabContext value={selectedChallengesTab}>
        <TabList
          onChange={(
            _event: React.SyntheticEvent,
            value: NewChallengePageTab
          ) => {
            setSelectedChallengesTab(value);
            // lastSelectedChallengesTab = value;
          }}
          aria-label="new challenge picker tabs"
        >
          <Tab
            label={
              <FormattedMessage
                defaultMessage="Official Templates"
                description="Challenges Page - Official Templates"
              />
            }
            value="templates"
          />
          {userId && (
            <Tab
              label={
                <FormattedMessage
                  defaultMessage="Your Published Challenges"
                  description="Challenges Page - Your Published Challenges section title"
                />
              }
              value="your-challenges"
            />
          )}
          <Tab
            label={
              <FormattedMessage
                defaultMessage="Community Challenges"
                description="Challenges Page - Community Challenges section title"
              />
            }
            value="community-challenges"
          />
          <Tab
            label={
              <FormattedMessage
                defaultMessage="Search"
                description="Challenges Page - Search section title"
              />
            }
            value="search"
          />
        </TabList>
        <FlexBox py={4}>
          {NewChallengePageTabValues.map((value) => (
            <TabPanel key={value} value={value}>
              <FlexBox>
                {value === 'templates' && (
                  <Typography variant="body2" align="center" mb={2}>
                    <FormattedMessage
                      defaultMessage="Select one of the templates below to begin creating your challenge"
                      description="New Challenge Page - Select a template to begin"
                    />
                  </Typography>
                )}
                {value === 'search' && (
                  <FlexBox mb={2}>
                    <TextField
                      placeholder="Search"
                      variant="outlined"
                      defaultValue={searchQuery}
                      onChange={debouncedUpdateSearchQuery}
                    />
                  </FlexBox>
                )}
                {(searchQuery.length > 0 || value !== 'search') && (
                  <ChallengesList tab={value} searchQuery={searchQuery} />
                )}
              </FlexBox>
            </TabPanel>
          ))}
        </FlexBox>
      </TabContext>
    </Page>
  );
}
