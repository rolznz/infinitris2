import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import React from 'react';

import FlexBox from '../../ui/FlexBox';
import ChallengeCard from './ChallengeCard';
import { orderBy, where } from 'firebase/firestore';
import { useIntl } from 'react-intl';
import { Page } from '@/components/ui/Page';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import { ReactComponent as SortIcon } from '@/icons/sort.svg';

const challengesPopularityFilter: UseCollectionOptions = {
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

const ChallengesPageFilterTypeValues = [
  'popularity',
  'rating',
  'date',
] as const;
type ChallengesPageFilterType = typeof ChallengesPageFilterTypeValues[number];

export function ChallengesPage() {
  const intl = useIntl();
  const [filter, setFilter] =
    React.useState<ChallengesPageFilterType>('popularity');
  const { data: challenges } = useCollection<IChallenge>(
    challengesPath,
    filter === 'popularity'
      ? challengesPopularityFilter
      : 'rating'
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
            setFilter(event.target.value as ChallengesPageFilterType);
          }}
        >
          {ChallengesPageFilterTypeValues.map((filterType) => (
            <MenuItem key={filterType} value={filterType}>
              {filterType}
            </MenuItem>
          ))}
        </Select>
      </FlexBox>

      <FlexBox
        width="100%"
        flexWrap="wrap"
        flexDirection="row"
        justifyContent="flex-start"
      >
        {challenges?.map((challenge) => (
          <FlexBox key={challenge.id} margin={4}>
            <ChallengeCard challenge={challenge} />
          </FlexBox>
        ))}
      </FlexBox>
    </Page>
  );
}
