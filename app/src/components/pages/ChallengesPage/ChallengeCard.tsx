import { Link as RouterLink } from 'react-router-dom';
import {
  getChallengePath,
  getScoreboardEntryPath,
  getVariationHueRotation,
  IChallenge,
  IScoreboardEntry,
  WorldType,
  WorldVariation,
  WorldVariationValues,
} from 'infinitris2-models';
import React from 'react';
import Routes from '../../../models/Routes';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import {
  deleteDoc,
  getFirestore,
  doc,
  DocumentSnapshot,
} from 'firebase/firestore';
import { launchFullscreen } from '@/utils/launchFullscreen';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { useUser } from '@/components/hooks/useUser';
import Button from '@mui/material/Button';
import FlexBox from '@/components/ui/FlexBox';
import { ChallengeGridPartialPreview } from '@/components/pages/ChallengesPage/ChallengeGridPartialPreview';
import { SxProps, Theme } from '@mui/material/styles';
import { borderRadiuses } from '@/theme/theme';

import grassImageMobile from '@/components/ui/RoomCarousel/assets/carousel/grass_mobile.svg';
import desertImageMobile from '@/components/ui/RoomCarousel/assets/carousel/desert_mobile.svg';
import volcanoImageMobile from '@/components/ui/RoomCarousel/assets/carousel/volcano_mobile.svg';
import spaceImageMobile from '@/components/ui/RoomCarousel/assets/carousel/space_mobile.svg';
import StarRatingComponent from 'react-star-rating-component';
import { useDocument } from 'swr-firestore';
import { FormattedMessage } from 'react-intl';

interface ChallengeCardProps {
  challenge: DocumentSnapshot<IChallenge>;
}

function deleteChallenge(challengeId: string) {
  deleteDoc(doc(getFirestore(), getChallengePath(challengeId)));
}

const cardFooterSx: SxProps<Theme> = {
  background:
    'linear-gradient(180deg, rgba(0,0,0, 0.024) 0%, rgba(0, 0, 0, 0.8) 77.08%)',
  position: 'absolute',
  bottom: 0,
  py: 2,
  width: '100%',
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  //const user = useUser();
  //const translation = challenge?.translations?.[user.locale];
  const isLocked = false; /*TODO: check unlocked features*/
  const user = useUser();
  const { data: challengeOwnerScoreboardEntry } = useDocument<IScoreboardEntry>(
    challenge?.data()?.userId
      ? getScoreboardEntryPath(challenge!.data()!.userId!)
      : null
  );

  const onClick = React.useCallback(() => {
    launchFullscreen();
    playSound(SoundKey.click);
  }, []);

  const cardSx: SxProps<Theme> = React.useMemo(
    () => ({
      background: getBackground(
        challenge.data()!.worldType,
        challenge.data()!.worldVariation
      ),
      borderRadius: borderRadiuses.base,
      position: 'relative',
      overflow: 'hidden',
    }),
    [challenge]
  );

  const card = (
    <FlexBox sx={cardSx}>
      <FlexBox sx={cardFooterSx}>
        <Typography variant="body1">
          {/*translation?.title || */ challenge.data()!.title}
          {isLocked && ' (LOCKED)'}
        </Typography>
        {challengeOwnerScoreboardEntry?.data()?.nickname && (
          <Typography variant="caption">
            <FormattedMessage
              defaultMessage="By {nickname}"
              description="challenge card by nickname"
              values={{
                nickname: challengeOwnerScoreboardEntry!.data()!.nickname,
              }}
            />
          </Typography>
        )}
      </FlexBox>
      <ChallengeGridPartialPreview grid={challenge.data()!.grid} />
      <StarRatingComponent
        name="challenge-score"
        starCount={5}
        value={challenge.data()?.readOnly?.rating || 0}
      />
    </FlexBox>
  );
  const link = isLocked ? (
    card
  ) : (
    <Link
      component={RouterLink}
      underline="none"
      to={`${Routes.challenges}/${challenge?.id}`}
      onClick={onClick}
    >
      {card}
    </Link>
  );

  return user.readOnly?.isAdmin ? (
    <FlexBox>
      {link}
      <Button
        variant="contained"
        color="error"
        onClick={(event) => {
          window.confirm(
            `Are you sure you want to delete ${
              challenge.data()!.title || 'Untitled'
            }?`
          ) && deleteChallenge(challenge.id);
          event.preventDefault();
        }}
      >
        Delete
      </Button>
    </FlexBox>
  ) : (
    link
  );
}

function getBackground(
  worldType: WorldType | undefined,
  worldVariation: WorldVariation | undefined
): string {
  let image: string = grassImageMobile;
  switch (worldType) {
    case undefined:
      break;
    case 'grass':
      break;
    case 'desert':
      image = desertImageMobile;
      break;
    case 'volcano':
      image = volcanoImageMobile;
      break;
    case 'space':
      image = spaceImageMobile;
      break;
    default:
      throw new Error('Unsupported world type: ' + worldType);
  }

  const hueRotation = getVariationHueRotation(
    WorldVariationValues.indexOf(worldVariation || '0')
  );

  return `url(${image}); filter: hue-rotate(${hueRotation}deg);`;
}
