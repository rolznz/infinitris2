import { tutorials } from 'infinitris2-models';
import React from 'react';
import useDemo from '../../hooks/useDemo';
import FlexBox from '../../layout/FlexBox';
import TutorialCard from './TutorialCard';

export function TutorialsPage() {
  useDemo();
  return (
    <FlexBox flex={1} padding={10} flexWrap="wrap" flexDirection="row">
      {tutorials
        .filter((tutorial) => tutorial.isPublished)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .map((tutorial) => (
          <FlexBox key={tutorial.id} margin={4}>
            <TutorialCard tutorial={tutorial} />
          </FlexBox>
        ))}
    </FlexBox>
  );
}
