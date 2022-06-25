import { Link as RouterLink } from 'react-router-dom';
import { getChallengePath, IChallenge } from 'infinitris2-models';
import React from 'react';
import Routes from '../../../models/Routes';
import ChallengeGridPreview from './ChallengeGridPreview';
import Card from '@mui/material/Card';
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

interface ChallengeCardProps {
  challenge: DocumentSnapshot<IChallenge>;
}

function deleteChallenge(challengeId: string) {
  deleteDoc(doc(getFirestore(), getChallengePath(challengeId)));
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  //const user = useUser();
  //const translation = challenge?.translations?.[user.locale];
  const isLocked = false; /*TODO: check unlocked features*/
  const user = useUser();

  const onClick = React.useCallback(() => {
    launchFullscreen();
    playSound(SoundKey.click);
  }, []);

  const card = (
    <Card>
      <Typography variant="body1">
        {/*translation?.title || */ challenge.data()!.title}
        {isLocked && ' (LOCKED)'}
      </Typography>
      <ChallengeGridPreview
        grid={challenge.data()!.grid}
        width={100}
        height={100}
      />
    </Card>
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
      )
    </FlexBox>
  ) : (
    link
  );
}
