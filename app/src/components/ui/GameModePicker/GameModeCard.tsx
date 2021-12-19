import React from 'react';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import { borderRadiuses, boxShadows } from '@/theme/theme';
import Routes from '@/models/Routes';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import FlexBox from '../FlexBox';

type GameModeCardProps = {
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

export function GameModeCard({
  image,
  link = Routes.comingSoon,
  title,
}: GameModeCardProps) {
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
  return (
    <RouterLink to={link} style={linkStyle}>
      <img src={image} alt="" style={imageStyle} />
      <FlexBox
        position="absolute"
        bottom={0}
        left={0}
        pl={2}
        pb={isLandscape ? 0.5 : 1.5}
      >
        <Typography
          variant={isLandscape ? 'h4' : 'h5'}
          lineHeight={isLandscape ? undefined : 1}
        >
          {title}
        </Typography>
      </FlexBox>
    </RouterLink>
  );
}
