import { Card, Link, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { ITutorial } from 'infinitris2-models';
import React from 'react';
import { useUser } from '../../../state/UserStore';
import Routes from '../../../models/Routes';
import useIncompleteTutorials from '../../hooks/useIncompleteTutorials';
import TutorialGridPreview from './TutorialGridPreview';

interface TutorialCardProps {
  tutorial: ITutorial;
}

export default function TutorialCard({ tutorial }: TutorialCardProps) {
  const user = useUser();
  const translation = tutorial?.translations?.[user.locale];
  const incompleteTutorials = useIncompleteTutorials();
  const isLocked = incompleteTutorials.find(
    (t) => t.isMandatory && (t.priority || 0) > (tutorial.priority || 0)
  );

  const child = (
    <Card>
      <Typography variant="body1">
        {translation?.title || tutorial.title}
        {isLocked && ' (LOCKED)'}
      </Typography>
      <TutorialGridPreview grid={tutorial.grid || '0'} />
    </Card>
  );

  return isLocked ? (
    child
  ) : (
    <Link
      component={RouterLink}
      underline="none"
      to={`${Routes.tutorials}/${tutorial?.id}`}
    >
      {child}
    </Link>
  );
}
