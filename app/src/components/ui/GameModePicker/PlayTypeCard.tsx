import React from 'react';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import { borderRadiuses, boxShadows, colors } from '@/theme/theme';
import Routes from '@/models/Routes';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import FlexBox from '../FlexBox';
import { playSound, SoundKey } from '@/sound/SoundManager';

type PlayTypeCardProps = {
  image: string;
  link?: string;
  title: React.ReactNode;
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  boxShadow: boxShadows.small,
  borderRadius: borderRadiuses.base,
};

export function PlayTypeCard({
  image,
  link = Routes.comingSoon,
  title,
}: PlayTypeCardProps) {
  const isLandscape = useIsLandscape();

  const linkStyle: React.CSSProperties = React.useMemo(
    () => ({
      width: isLandscape ? '29%' : '47%',
      height: isLandscape ? '44%' : undefined,
      marginTop: '2%',
      cursor: 'pointer',
      position: 'relative',
    }),
    [isLandscape]
  );
  function onClick() {
    playSound(SoundKey.click);
  }

  return (
    <RouterLink to={link} style={linkStyle} onClick={onClick}>
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
