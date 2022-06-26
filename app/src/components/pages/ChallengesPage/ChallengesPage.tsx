import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { challengesPath, IChallenge } from 'infinitris2-models';
import React from 'react';

import FlexBox from '../../ui/FlexBox';
import ChallengeCard from './ChallengeCard';
import { orderBy, where } from 'firebase/firestore';
import { useIntl } from 'react-intl';
import { Page } from '@/components/ui/Page';

// TODO: support multiple filter types
const challengesFilter: UseCollectionOptions = {
  constraints: [
    where('isOfficial', '==', false),
    orderBy('readOnly.rating', 'desc'),
  ],
};

export function ChallengesPage() {
  const intl = useIntl();
  const { data: challenges } = useCollection<IChallenge>(
    challengesPath,
    challengesFilter
  );
  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Community Challenges',
        description: 'Community Challenges page title',
      })}
    >
      <FlexBox
        width="100%"
        flexWrap="wrap"
        flexDirection="row"
        justifyContent="flex-start"
      >
        {challenges
          ?.filter((challenge) => challenge.data()!.isPublished)
          .sort((a, b) => (b.data()!.priority || 0) - (a.data()!.priority || 0))
          .map((challenge) => (
            <FlexBox key={challenge.id} margin={4}>
              <ChallengeCard challenge={challenge} />
            </FlexBox>
          ))}
      </FlexBox>
    </Page>
  );
}
