import { Card, Link, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { IChallenge } from 'infinitris2-models';
import React from 'react';
import { useUser } from '../../../state/UserStore';
import Routes from '../../../models/Routes';
import useIncompleteChallenges from '../../hooks/useIncompleteChallenges';
import ChallengeGridPreview from './ChallengeGridPreview';

interface ChallengeCardProps {
  challenge: IChallenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const user = useUser();
  const translation = challenge?.translations?.[user.locale];
  const incompleteChallenges = useIncompleteChallenges();
  const isLocked = incompleteChallenges.find(
    (t) => t.isMandatory && (t.priority || 0) > (challenge.priority || 0)
  );

  const child = (
    <Card>
      <Typography variant="body1">
        {translation?.title || challenge.title}
        {isLocked && ' (LOCKED)'}
      </Typography>
      <ChallengeGridPreview grid={challenge.grid || '0'} />
    </Card>
  );

  return isLocked ? (
    child
  ) : (
    <Link
      component={RouterLink}
      underline="none"
      to={`${Routes.challenges}/${challenge?.id}`}
    >
      {child}
    </Link>
  );
}
