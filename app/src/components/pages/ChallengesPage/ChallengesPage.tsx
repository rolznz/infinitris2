import { UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import React from 'react';

import FlexBox from '../../ui/FlexBox';
import {
  challengeCardHeight,
  challengeCardWidth,
  CommunityChallengeCard,
} from './ChallengeCard';
import {
  DocumentSnapshot,
  orderBy,
  QueryDocumentSnapshot,
  where,
} from 'firebase/firestore';
import { FormattedMessage, useIntl } from 'react-intl';
import { Page } from '@/components/ui/Page';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import { ReactComponent as SortIcon } from '@/icons/sort.svg';
import useSearchParam from 'react-use/lib/useSearchParam';
//import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import { InfiniteLoader } from '@/components/ui/InfiniteLoader';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import useWindowSize from 'react-use/lib/useWindowSize';

const ChallengesPageSortTypeValues = [
  'mostPlays',
  'mostRatings',
  'rating',
  'latest',
] as const;
export type ChallengesPageSortType =
  typeof ChallengesPageSortTypeValues[number];
export const challengesPageSortParam = 'sort';

const cachedChallenges: Record<
  ChallengesPageSortType,
  QueryDocumentSnapshot<IChallenge>[]
> = {
  mostPlays: [],
  mostRatings: [],
  rating: [],
  latest: [],
};

function ChallengesPageChallengeList({
  sortType,
}: {
  sortType: ChallengesPageSortType;
}) {
  const [challenges, setChallenges] = React.useState<
    QueryDocumentSnapshot<IChallenge>[]
  >(cachedChallenges[sortType]);

  // TODO: remove listen param and wait for challenge to be created before navigating

  const challengesMostPlaysFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', false),
        orderBy('readOnly.numAttempts', 'desc'),
      ],
    }),
    []
  );

  const challengesMostRatingsFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', false),
        orderBy('readOnly.numRatings', 'desc'),
        orderBy('readOnly.rating', 'desc'),
      ],
    }),
    []
  );

  const challengesRatingFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', false),
        orderBy('readOnly.rating', 'desc'),
        orderBy('readOnly.numRatings', 'desc'),
      ],
    }),
    []
  );
  const challengesDateFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', false),
        orderBy('readOnly.createdTimestamp', 'desc'),
      ],
    }),
    []
  );

  const onNewItemsLoaded = React.useCallback(
    (newItems: QueryDocumentSnapshot<IChallenge>[]) => {
      cachedChallenges[sortType] = cachedChallenges[sortType].concat(newItems);
      setChallenges(cachedChallenges[sortType]);
      console.log('Loaded', cachedChallenges[sortType].length, 'challenges');
    },
    [sortType]
  );

  const renderItem = React.useCallback<
    (challenge: DocumentSnapshot<IChallenge>) => React.ReactNode
  >((challenge) => {
    return <CommunityChallengeCard challenge={challenge} key={challenge.id} />;
  }, []);

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
        sortType === 'mostPlays'
          ? challengesMostPlaysFilter
          : sortType === 'mostRatings'
          ? challengesMostRatingsFilter
          : sortType === 'rating'
          ? challengesRatingFilter
          : challengesDateFilter
      }
      justifyContent="center"
    />
  );
}

export function ChallengesPage() {
  const intl = useIntl();

  const sortParam = useSearchParam(
    challengesPageSortParam
  ) as ChallengesPageSortType;

  const [sortType, setSortType] = React.useState<ChallengesPageSortType>(
    sortParam && ChallengesPageSortTypeValues.indexOf(sortParam) > -1
      ? sortParam
      : 'mostRatings'
  );

  //const isLandscape = useIsLandscape();

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Community Challenges',
        description: 'Community Challenges page title',
      })}
    >
      <FlexBox flexDirection="row" mb={2}>
        <SvgIcon color="primary">
          <SortIcon />
        </SvgIcon>
        <Select
          variant="outlined"
          value={sortType}
          onChange={(event) => {
            setSortType(event.target.value as ChallengesPageSortType);
          }}
        >
          {ChallengesPageSortTypeValues.map((filterType) => (
            <MenuItem key={filterType} value={filterType}>
              {filterType === 'mostPlays' ? (
                <FormattedMessage
                  defaultMessage="Most Plays"
                  description="Challenges Page Most plays filter"
                />
              ) : filterType === 'mostRatings' ? (
                <FormattedMessage
                  defaultMessage="Most Ratings"
                  description="Challenges Page Most ratings filter"
                />
              ) : filterType === 'latest' ? (
                <FormattedMessage
                  defaultMessage="Latest"
                  description="Challenges Page Latest filter"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Highest Rated"
                  description="Challenges Page Highest Rated filter"
                />
              )}
            </MenuItem>
          ))}
        </Select>
      </FlexBox>

      {/* use a unique list for each sort type */}
      {ChallengesPageSortTypeValues.map((value) =>
        sortType === value ? (
          <ChallengesPageChallengeList key={sortType} sortType={sortType} />
        ) : null
      )}
    </Page>
  );
}
