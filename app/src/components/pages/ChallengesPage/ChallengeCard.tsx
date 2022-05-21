import { Link as RouterLink } from 'react-router-dom';
import { IChallenge } from 'infinitris2-models';
import React from 'react';
import Routes from '../../../models/Routes';
import useIncompleteChallenges from '../../hooks/useIncompleteChallenges';
import ChallengeGridPreview from './ChallengeGridPreview';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { DocumentSnapshot } from 'firebase/firestore';
import { launchFullscreen } from '@/utils/launchFullscreen';
import { playSound, SoundKey } from '@/sound/SoundManager';

interface ChallengeCardProps {
  challenge: DocumentSnapshot<IChallenge>;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  //const user = useUser();
  //const translation = challenge?.translations?.[user.locale];
  const { incompleteChallenges } = useIncompleteChallenges();
  const isLocked = false; /*incompleteChallenges.find(
    (t) =>
      t.data()!.isMandatory &&
      (t.data()!.priority || 0) > (challenge.data()!.priority || 0)
  );*/

  const onClick = React.useCallback(() => {
    launchFullscreen();
    playSound(SoundKey.click);
  }, []);

  const child = (
    <Card>
      <Typography variant="body1">
        {/*translation?.title || */ challenge.data()!.title}
        {isLocked && ' (LOCKED)'}
      </Typography>
      <ChallengeGridPreview
        grid={challenge.data()!.grid || '0'}
        width={100}
        height={100}
      />
    </Card>
  );

  return isLocked ? (
    child
  ) : (
    <Link
      component={RouterLink}
      underline="none"
      to={`${Routes.challenges}/${challenge?.id}`}
      onClick={onClick}
    >
      {child}
    </Link>
  );
}
