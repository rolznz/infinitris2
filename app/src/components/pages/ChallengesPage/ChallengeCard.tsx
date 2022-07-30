import { Link as RouterLink } from 'react-router-dom';
import {
  getChallengePath,
  getScoreboardEntryPath,
  IChallenge,
  IScoreboardEntry,
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
import { SxProps, Theme } from '@mui/material/styles';
import { borderRadiuses } from '@/theme/theme';

import { useDocument } from 'swr-firestore';
import { ReactComponent as TimesRatedIcon } from '@/icons/times_rated.svg';
import { ReactComponent as StarIcon } from '@/icons/star.svg';
import { ReactComponent as PlayIcon } from '@/icons/play.svg';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';

interface ChallengeCardProps {
  challenge: DocumentSnapshot<IChallenge>;
  onClick?(): void;
}

function deleteChallenge(challengeId: string) {
  deleteDoc(doc(getFirestore(), getChallengePath(challengeId)));
}

const gridPreviewSx: SxProps<Theme> = {
  //opacity: 0.6,
};

const cardFooterSx: SxProps<Theme> = {
  background:
    'linear-gradient(180deg, rgba(0,0,0, 0) 0%, rgba(0,0,0, 0.2) 25%, rgba(0, 0, 0, 0.8) 77.08%)',
  position: 'absolute',
  bottom: 0,
  py: 2,
  width: '100%',
  zIndex: 2,
};

export function CommunityChallengeCard({ challenge }: ChallengeCardProps) {
  const onClick = React.useCallback(() => {
    launchFullscreen();
    playSound(SoundKey.click);
  }, []);

  return (
    <Link
      component={RouterLink}
      underline="none"
      to={`${Routes.challenges}/${challenge?.id}`}
      onClick={onClick}
    >
      <ChallengeCard challenge={challenge} />
    </Link>
  );
}

export default function ChallengeCard({
  challenge,
  onClick,
}: ChallengeCardProps) {
  //const user = useUser();
  //const translation = challenge?.translations?.[user.locale];
  const user = useUser();
  // FIXME: this is very inefficient. Challenges should be updated to include creator nickname
  const { data: challengeOwnerScoreboardEntry } = useDocument<IScoreboardEntry>(
    challenge?.data()?.userId
      ? getScoreboardEntryPath(challenge!.data()!.userId!)
      : null
  );

  const cardSx: SxProps<Theme> = React.useMemo(
    () => ({
      borderRadius: borderRadiuses.base,
      position: 'relative',
      overflow: 'hidden',
    }),
    []
  );

  // FIXME: hardcoded width(200px)/height(267px), fallback image should come from challenge (base64 preview)
  return (
    <FlexBox>
      <FlexBox sx={cardSx} onClick={onClick}>
        <FlexBox
          zIndex={1}
          sx={gridPreviewSx}
          width="200px"
          height="267px"
          bgcolor="black"
        >
          <img
            alt=""
            src={`${process.env.REACT_APP_IMAGES_ROOT_URL}/challenges/${challenge.id}/card.png`}
            width="200px"
          />
        </FlexBox>
        <FlexBox sx={cardFooterSx} alignItems="flex-start" px={1}>
          <Typography variant="body1" fontSize="20px" mb={1}>
            {/*translation?.title || */ challenge.data()!.title}
            {/* {isLocked && ' (LOCKED)'} */}
          </Typography>
          <FlexBox flexDirection="row" gap={0.25}>
            {challengeOwnerScoreboardEntry?.data()?.nickname && (
              <Typography variant="body1" fontSize="12px">
                {challengeOwnerScoreboardEntry!.data()!.nickname}
              </Typography>
            )}
            <FlexBox width={10} />
            <SvgIcon fontSize="small">
              <StarIcon />
            </SvgIcon>
            <Typography variant="body1" fontSize="12px">
              {(challenge.data()?.readOnly?.rating || 0).toFixed(1).toString()}
            </Typography>
            <FlexBox width={5} />
            <SvgIcon fontSize="small">
              <TimesRatedIcon />
            </SvgIcon>
            <Typography variant="body1" fontSize="12px">
              {challenge.data()?.readOnly?.numRatings || 0}
            </Typography>
            <FlexBox width={5} />
            <SvgIcon fontSize="small">
              <PlayIcon />
            </SvgIcon>
            <Typography variant="body1" fontSize="12px">
              {(challenge.data()?.readOnly?.numAttempts || 0).toString()}
            </Typography>
          </FlexBox>
        </FlexBox>
      </FlexBox>
      {user.readOnly?.isAdmin && (
        <FlexBox>
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
      )}
    </FlexBox>
  );
}
