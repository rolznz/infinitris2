import React from 'react';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import { borderRadiuses, boxShadows, colors } from '@/theme/theme';
import Routes from '@/models/Routes';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import FlexBox from '../FlexBox';
import { playSound, SoundKey } from '@/sound/SoundManager';
import padlockLockedImage from '@/components/ui/Locks/padlock_locked.png';

type PlayTypeCardProps = {
  image: string;
  link?: string;
  title: React.ReactNode;
  isLocked?: boolean;
};

export function PlayTypeCard({
  image,
  link = Routes.comingSoon,
  title,
  isLocked,
}: PlayTypeCardProps) {
  const isLandscape = useIsLandscape();

  const linkStyle: React.CSSProperties = React.useMemo(
    () => ({
      width: isLandscape ? '29%' : '47%',
      height: isLandscape ? '45%' : undefined,
      marginTop: isLandscape ? '0%' : '2%',
      cursor: 'pointer',
      position: 'relative',
      pointerEvents: isLocked ? 'none' : undefined,
    }),
    [isLandscape, isLocked]
  );
  function onClick() {
    playSound(SoundKey.click);
  }

  const imageStyle: React.CSSProperties = React.useMemo(
    () => ({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      boxShadow: boxShadows.small,
      borderRadius: borderRadiuses.base,
      filter: isLocked ? 'grayscale(80%)' : undefined,
    }),
    [isLocked]
  );

  return (
    <RouterLink to={isLocked ? '#' : link} style={linkStyle} onClick={onClick}>
      {isLocked && (
        <FlexBox position="absolute" width="100%" height="100%">
          <img
            alt="locked"
            style={{
              zIndex: 1,
            }}
            src={padlockLockedImage}
            width={'100px'}
          />
        </FlexBox>
      )}
      <img src={image} alt="" style={imageStyle} />
      <FlexBox
        position="absolute"
        bottom={0}
        left={0}
        pl={2}
        pb={isLandscape ? 0.5 : 2}
      >
        <Typography
          variant="h4"
          lineHeight={isLandscape ? undefined : 1}
          fontSize="20px"
          color={colors.white}
        >
          {title}
        </Typography>
      </FlexBox>
    </RouterLink>
  );
}
