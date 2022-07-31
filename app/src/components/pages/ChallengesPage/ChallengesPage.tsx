import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import React from 'react';

import FlexBox from '../../ui/FlexBox';
import { CommunityChallengeCard } from './ChallengeCard';
import { orderBy, where } from 'firebase/firestore';
import { FormattedMessage, useIntl } from 'react-intl';
import { Page } from '@/components/ui/Page';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import { ReactComponent as SortIcon } from '@/icons/sort.svg';
import useSearchParam from 'react-use/lib/useSearchParam';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';

const ChallengesPageSortTypeValues = [
  'mostPlays',
  'mostRatings',
  'rating',
  'latest',
] as const;
export type ChallengesPageSortType =
  typeof ChallengesPageSortTypeValues[number];
export const challengesPageSortParam = 'sort';
export const challengesPageListenParam = 'listen';

export function ChallengesPage() {
  const intl = useIntl();
  const sortParam = useSearchParam(
    challengesPageSortParam
  ) as ChallengesPageSortType;
  const listen = useSearchParam(challengesPageListenParam) === 'true';
  const isLandscape = useIsLandscape();

  const [filter, setFilter] = React.useState<ChallengesPageSortType>(
    sortParam && ChallengesPageSortTypeValues.indexOf(sortParam) > -1
      ? sortParam
      : 'mostPlays'
  );

  const challengesMostPlaysFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', false),
        orderBy('readOnly.numAttempts', 'desc'),
      ],
      listen,
    }),
    [listen]
  );

  const challengesMostRatingsFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', false),
        orderBy('readOnly.numRatings', 'desc'),
        orderBy('readOnly.rating', 'desc'),
      ],
      listen,
    }),
    [listen]
  );

  const challengesRatingFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', false),
        orderBy('readOnly.rating', 'desc'),
        orderBy('readOnly.numRatings', 'desc'),
      ],
      listen,
    }),
    [listen]
  );
  const challengesDateFilter: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where('isOfficial', '==', false),
        orderBy('readOnly.createdTimestamp', 'desc'),
      ],
      listen,
    }),
    [listen]
  );

  const { data: challenges } = useCollection<IChallenge>(
    challengesPath,
    filter === 'mostPlays'
      ? challengesMostPlaysFilter
      : filter === 'mostRatings'
      ? challengesMostRatingsFilter
      : filter === 'rating'
      ? challengesRatingFilter
      : challengesDateFilter
  );
  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Community Challenges',
        description: 'Community Challenges page title',
      })}
    >
      <FlexBox flexDirection="row">
        <SvgIcon color="primary">
          <SortIcon />
        </SvgIcon>
        <Select
          variant="outlined"
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value as ChallengesPageSortType);
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

      <FlexBox
        width="100%"
        flexWrap="wrap"
        flexDirection="row"
        gap={isLandscape ? 4 : 2}
        pt={2}
      >
        {challenges?.map((challenge) => (
          <CommunityChallengeCard challenge={challenge} key={challenge.id} />
        ))}
      </FlexBox>
    </Page>
  );
}
