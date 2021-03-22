import FlexBox from '@/components/layout/FlexBox';
import { getChallengePath, getRatingsPath as getRatingPath } from '@/firebase';
import useAuthStore from '@/state/AuthStore';
import { Typography } from '@material-ui/core';
import { set, useDocument } from '@nandorojo/swr-firestore';
import { IChallenge, IRating } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import StarRatingComponent from 'react-star-rating-component';

interface ChallengeRatingDisplayProps {
  isTest: boolean;
  challengeId: string;
}

export default function ChallengeRatingDisplay({
  isTest,
  challengeId,
}: ChallengeRatingDisplayProps) {
  const userId = useAuthStore().user?.uid;

  const { data: challenge } = useDocument<IChallenge>(
    !isTest && challengeId ? getChallengePath(challengeId) : null
  );
  const ratingPath = userId
    ? getRatingPath('challenge', challengeId, userId)
    : null;
  const { data: userRating } = useDocument<IRating>(ratingPath);

  const numRatings = challenge?.numRatings || 0;
  const totalRating = challenge?.totalRating || 0;
  function onStarClick(nextValue: number, prevValue: number) {
    if (userRating) {
      // TODO: allow rating updates
      alert('You have already voted');
      return;
    }
    if (nextValue !== prevValue) {
      if (userId) {
        const newRating: IRating = {
          value: nextValue / 5.0,
          entityType: 'challenge',
          entityId: challengeId,
          userId,
        };
        set(ratingPath, newRating);
      } else {
        alert('TODO login');
      }
    }
  }

  return (
    <FlexBox>
      <Typography variant="caption">
        <FormattedMessage
          defaultMessage="Rate this challenge"
          description="Give a rating for this challenge text"
        />
      </Typography>
      <div style={{ fontSize: 96 }}>
        <StarRatingComponent
          name="challenge-score"
          editing={true}
          starCount={5}
          value={0}
          onStarClick={onStarClick}
        />
      </div>
      <Typography variant="caption">
        <FormattedMessage
          defaultMessage="Rated {totalRating} ({numRatings} votes)"
          description="Current rating statistics"
          values={{ totalRating, numRatings }}
        />
      </Typography>
    </FlexBox>
  );
}
