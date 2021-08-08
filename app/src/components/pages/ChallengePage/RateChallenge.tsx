import FlexBox from '@/components/ui/FlexBox';
import LoginDialog from '@/components/ui/modals/LoginDialog';
import useAuthStore from '@/state/AuthStore';
import { Typography } from '@material-ui/core';
import {
  Document,
  revalidateDocument,
  set,
  useDocument,
} from '@nandorojo/swr-firestore';
import {
  getChallengePath,
  getRatingPath,
  IChallenge,
  IRating,
} from 'infinitris2-models';
import React, { useState } from 'react';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import StarRatingComponent from 'react-star-rating-component';
import { toast } from 'react-toastify';

interface ChallengeRatingDisplayProps {
  isTest: boolean;
  challengeId: string;
}

async function addRating(
  nextValue: number,
  userId: string,
  ratingPath: string,
  challengeId: string,
  intl: IntlShape,
  userRating: Document<IRating> | null | undefined
) {
  if (userRating?.exists) {
    alert('You have already voted');
    return;
  }
  // NB: when updating this list, also update firestore rules
  const newRating: Omit<IRating, 'userId'> = {
    value: nextValue,
    entityCollectionPath: 'challenges',
    entityId: challengeId,
    created: false,
  };
  console.log('Adding rating', ratingPath, newRating);
  toast(
    intl.formatMessage({
      defaultMessage: 'Thanks for rating!',
      description: 'Thanks for rating toast message',
    })
  );
  try {
    await set(ratingPath, newRating);
    await revalidateDocument(ratingPath); // TODO: why is this needed in order for the local cache to be updated?
    // wait for the firebase onCreateRating function to run
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await revalidateDocument(getChallengePath(challengeId));
    console.log('Vote sent');
  } catch (e) {
    console.error(e);
    alert(`Failed to vote\n${e.message}`);
  }
}

export default function RateChallenge({
  isTest,
  challengeId,
}: ChallengeRatingDisplayProps) {
  const intl = useIntl();
  const userId = useAuthStore().user?.uid;
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [guestRating, setGuestRating] = useState(0);

  const { data: challenge } = useDocument<IChallenge>(
    !isTest && challengeId ? getChallengePath(challengeId) : null
  );
  const ratingPath = userId
    ? getRatingPath('challenges', challengeId, userId)
    : null;
  const { data: userRating } = useDocument<IRating>(ratingPath);

  const numRatings = challenge?.readOnly?.numRatings || 0;
  const totalRating = challenge?.readOnly?.rating || 0;
  async function onStarClick(value: number) {
    if (userId && ratingPath) {
      addRating(value, userId, ratingPath, challengeId, intl, userRating);
    } else {
      setGuestRating(value);
      setLoginModalOpen(true);
    }
  }

  return (
    <FlexBox my={2}>
      <LoginDialog
        isOpen={isLoginModalOpen}
        onLogin={(newUserId) => {
          // rating path and user ID cannot be used because are not set in the current component state (user just logged in)
          addRating(
            guestRating,
            newUserId,
            getRatingPath('challenges', challengeId, newUserId),
            challengeId,
            intl,
            userRating
          );
        }}
        onClose={() => {
          setLoginModalOpen(false);
        }}
      />
      <Typography>
        <FormattedMessage
          defaultMessage="Rate this challenge"
          description="Give a rating for this challenge text"
        />
      </Typography>
      <FlexBox style={{ fontSize: 96 }} mb={-2} mt={-3}>
        <StarRatingComponent
          name="challenge-score"
          editing={true}
          starCount={5}
          value={userRating?.exists ? userRating.value : hoverRating}
          onStarClick={onStarClick}
          onStarHover={(value) => setHoverRating(value)}
          onStarHoverOut={() => setHoverRating(0)}
        />
      </FlexBox>
      <Typography variant="caption">
        <FormattedMessage
          defaultMessage="Rated {totalRating} ({numRatings} votes)"
          description="Current rating statistics"
          values={{ totalRating: (totalRating || 0).toFixed(2), numRatings }}
        />
      </Typography>
    </FlexBox>
  );
}
