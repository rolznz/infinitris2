import React from 'react';
import FlexBox from '@components/ui/FlexBox';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';

type GameModeCardProps = {
  image: string;
};

export function GameModeCard({ image }: GameModeCardProps) {
  const isLandscape = useIsLandscape();
  return (
    <FlexBox
      sx={{
        width: isLandscape ? '25.1%' : '47%',
        p: '0%',
      }}
    >
      <img src={image} alt="" width="100%" height="100%" />
    </FlexBox>
  );
}
