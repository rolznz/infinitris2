import FlexBox from '@/components/ui/FlexBox';
import useAuthStore from '@/state/AuthStore';
import { Typography } from '@mui/material';
import { useDocument, UseDocumentOptions } from 'swr-firestore';
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
import {
  doc,
  DocumentSnapshot,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import { openLoginDialog } from '@/state/DialogStore';

const useChallengeOptions: UseDocumentOptions = {
  listen: true,
};

interface ChallengeRatingDisplayProps {
  challengeId: string;
}

async function addRating(
  nextValue: number,
  userId: string,
  ratingPath: string,
  challengeId: string,
  intl: IntlShape,
  userRating: DocumentSnapshot<IRating> | null | undefined
): Promise<boolean> {
  if (userRating?.exists()) {
    alert('You have already voted');
    return false;
  }
  // NB: when updating this list, also update firestore rules
  const newRating: IRating = {
    value: nextValue,
    entityCollectionPath: 'challenges',
    entityId: challengeId,
    created: false,
    userId,
  };
  //console.log('Adding rating', ratingPath, newRating);
  try {
    // FIXME: save rating
    await setDoc(doc(getFirestore(), ratingPath), newRating);
    console.log('Vote sent');
    toast(
      intl.formatMessage({
        defaultMessage: 'Thanks for rating!',
        description: 'Thanks for rating toast message',
      })
    );
    return true;
  } catch (e) {
    console.error(e);
    alert(`Failed to vote`);
    return false;
  }
}

export default function RateChallenge({
  challengeId,
}: ChallengeRatingDisplayProps) {
  const intl = useIntl();
  const userId = useAuthStore().user?.uid;
  const [hoverRating, setHoverRating] = useState(0);
  const [chosenRating, setChosenRating] = useState<number | undefined>(
    undefined
  );

  const { data: challenge } = useDocument<IChallenge>(
    challengeId ? getChallengePath(challengeId) : null,
    useChallengeOptions
  );
  const ratingPath = userId
    ? getRatingPath('challenges', challengeId, userId)
    : null;
  const { data: userRating } = useDocument<IRating>(ratingPath);

  const numRatings = challenge?.data()?.readOnly?.numRatings || 0;
  const totalRating = challenge?.data()?.readOnly?.rating || 0;
  async function onStarClick(value: number) {
    setChosenRating(value);
    if (userId && ratingPath) {
      if (
        !(await addRating(
          value,
          userId,
          ratingPath,
          challengeId,
          intl,
          userRating
        ))
      ) {
        setChosenRating(undefined);
      }
    } else {
      openLoginDialog(false);

      /**
       * TODO: after login auto-add rating - need a react effect
       * addRating(
            guestRating,
            newUserId,
            getRatingPath('challenges', challengeId, newUserId),
            challengeId,
            intl,
            userRating
          );
       */
    }
  }

  // TODO: use openLoginDialog
  return (
    <FlexBox my={2}>
      <Typography>
        <FormattedMessage
          defaultMessage="Rate this challenge"
          description="Give a rating for this challenge text"
        />
      </Typography>
      <FlexBox style={{ fontSize: 36 }} mb={-1} mt={-1}>
        <StarRatingComponent
          name="challenge-score"
          editing={true}
          starCount={5}
          value={chosenRating ?? userRating?.data()?.value ?? hoverRating}
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
