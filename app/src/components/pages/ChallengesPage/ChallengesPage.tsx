import { UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge, verifyProperty } from 'infinitris2-models';
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
import TextField from '@mui/material/TextField';
import { debounce } from 'ts-debounce';

const ChallengesPageSortTypeValues = [
  'mostPlays',
  'mostRatings',
  'rating',
  'latest',
  'search',
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
  search: [],
};

const challengesMostPlaysFilter: UseCollectionOptions = {
  constraints: [
    where('isOfficial', '==', false),
    orderBy('readOnly.numAttempts', 'desc'),
  ],
};

const challengesMostRatingsFilter: UseCollectionOptions = {
  constraints: [
    where('isOfficial', '==', false),
    orderBy('readOnly.numRatings', 'desc'),
    orderBy('readOnly.rating', 'desc'),
  ],
};

const challengesRatingFilter: UseCollectionOptions = {
  constraints: [
    where('isOfficial', '==', false),
    orderBy('readOnly.rating', 'desc'),
    orderBy('readOnly.numRatings', 'desc'),
  ],
};

const challengesDateFilter: UseCollectionOptions = {
  constraints: [
    where('isOfficial', '==', false),
    orderBy('readOnly.createdTimestamp', 'desc'),
  ],
};

function ChallengesPageChallengeList({
  sortType,
  searchQuery,
}: {
  sortType: ChallengesPageSortType;
  searchQuery: string;
}) {
  const [challenges, setChallenges] = React.useState<
    QueryDocumentSnapshot<IChallenge>[]
  >(cachedChallenges[sortType]);

  React.useEffect(() => {
    if (sortType === 'search') {
      // reset challenges when search query changes
      setChallenges([]);
    }
  }, [sortType, searchQuery]);

  const searchChallengesFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', false),
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
          : sortType === 'latest'
          ? challengesDateFilter
          : searchChallengesFilter
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

  //const isLandscape = useIsLandscape();

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Community Challenges',
        description: 'Community Challenges page title',
      })}
    >
      <FlexBox flexDirection="row" mb={2} gap={1}>
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
              ) : filterType === 'rating' ? (
                <FormattedMessage
                  defaultMessage="Highest Rated"
                  description="Challenges Page Highest Rated filter"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Search"
                  description="Challenges Page Search filter"
                />
              )}
            </MenuItem>
          ))}
        </Select>
      </FlexBox>
      {sortType === 'search' && (
        <FlexBox mb={2}>
          <TextField
            placeholder="Search"
            variant="outlined"
            defaultValue={searchQuery}
            onChange={debouncedUpdateSearchQuery}
          />
        </FlexBox>
      )}

      {/* use a unique list for each sort type */}
      {ChallengesPageSortTypeValues.map((value) =>
        sortType === value && (value !== 'search' || searchQuery.length > 0) ? (
          <ChallengesPageChallengeList
            key={sortType}
            sortType={sortType}
            searchQuery={searchQuery}
          />
        ) : null
      )}
    </Page>
  );
}
