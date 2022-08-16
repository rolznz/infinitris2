import { Link as RouterLink } from 'react-router-dom';
import { getChallengePath, IChallenge } from 'infinitris2-models';
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
import { borderRadiuses, boxShadows } from '@/theme/theme';

import { ReactComponent as TimesRatedIcon } from '@/icons/times_rated.svg';
import { ReactComponent as StarIcon } from '@/icons/star.svg';
import { ReactComponent as PlayIcon } from '@/icons/play.svg';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import isMobile from '@/utils/isMobile';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import { PlacingStar } from '@/components/pages/Characters/PlacingStar';
import { Tooltip } from '@mui/material';

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

const cardHeaderSx: SxProps<Theme> = {
  zIndex: 2,
};

export const challengeCardWidth = isMobile() ? 150 : 200;
export const challengeCardHeight = Math.floor(challengeCardWidth * (4 / 3));

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

function _ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  //const user = useUser();
  //const translation = challenge?.translations?.[user.locale];
  const user = useUser();
  console.log('Rerender challenge card ' + challenge.id);

  const cardSx: SxProps<Theme> = React.useMemo(
    () => ({
      borderRadius: borderRadiuses.base,
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
    }),
    []
  );

  return (
    <FlexBox>
      <FlexBox sx={cardSx} onClick={onClick}>
        <FlexBox
          zIndex={1}
          sx={gridPreviewSx}
          width={challengeCardWidth + 'px'}
          height={challengeCardHeight + 'px'}
        >
          <ProgressiveImage
            width={challengeCardWidth}
            height={challengeCardHeight}
            thumbnail={challenge.data()?.readOnly?.thumbnail}
            url={`${process.env.REACT_APP_IMAGES_ROOT_URL}/challenges/${challenge.id}/card.jpg`}
            blur={false}
          />
        </FlexBox>
        <FlexBox
          sx={cardHeaderSx}
          justifyContent="flex-start"
          flexDirection="row"
          position="absolute"
          top={0}
          mt={1}
          ml={2}
          width="100%"
        >
          <FlexBox
            sx={cardHeaderSx}
            justifyContent="flex-start"
            px={1}
            flexDirection="row"
            borderRadius={borderRadiuses.full}
            boxShadow={boxShadows.small}
          >
            {challenge.data()?.readOnly?.topAttempts?.map((attempt, index) => (
              <Tooltip
                key={attempt.id}
                title={
                  (attempt.readOnly?.user?.nickname ?? 'Unknown Player') +
                  ' - ' +
                  (attempt.stats.timeTakenMs / 1000).toFixed(2) +
                  's'
                }
              >
                <FlexBox
                  key={attempt.id}
                  position="relative"
                  mx={-0.5}
                  my={-0.25}
                >
                  <CharacterImage
                    characterId={
                      attempt.readOnly?.user?.selectedCharacterId ||
                      DEFAULT_CHARACTER_ID
                    }
                    width={48}
                    thumbnailOnly
                  />
                  <PlacingStar
                    offset={10}
                    scale={0.35}
                    placing={index + 1}
                    numberOnly
                  />
                </FlexBox>
              </Tooltip>
            ))}
          </FlexBox>
        </FlexBox>
        <FlexBox sx={cardFooterSx} alignItems="flex-start" px={1}>
          <Typography variant="body1" fontSize="20px">
            {/*translation?.title || */ challenge.data()!.title}
            {/* {isLocked && ' (LOCKED)'} */}
          </Typography>
          <Typography variant="body1" fontSize="12px">
            By {challenge.data()?.readOnly?.user?.nickname || 'Unknown'}
          </Typography>
          <FlexBox flexDirection="row" gap={0.25} mt={0.5} width="100%">
            <SvgIcon fontSize="small">
              <StarIcon />
            </SvgIcon>
            <Typography variant="body1" fontSize="14px">
              {(challenge.data()?.readOnly?.rating || 0).toFixed(1).toString()}
            </Typography>
            <FlexBox width={5} />
            <SvgIcon fontSize="small">
              <TimesRatedIcon />
            </SvgIcon>
            <Typography variant="body1" fontSize="14px">
              {challenge.data()?.readOnly?.numRatings || 0}
            </Typography>
            <FlexBox width={5} />
            <SvgIcon fontSize="small">
              <PlayIcon />
            </SvgIcon>
            <Typography variant="body1" fontSize="14px">
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

const ChallengeCard = React.memo(_ChallengeCard, () => true);
export default ChallengeCard;
