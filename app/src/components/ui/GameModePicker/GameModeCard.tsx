import React from 'react';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import { boxShadows } from '@/theme/theme';
import Routes from '@/models/Routes';
import { Link as RouterLink } from 'react-router-dom';

type GameModeCardProps = {
  image: string;
  link?: string;
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  boxShadow: boxShadows.small,
};

export function GameModeCard({
  image,
  link = Routes.comingSoon,
}: GameModeCardProps) {
  const isLandscape = useIsLandscape();

  const linkStyle: React.CSSProperties = React.useMemo(
    () => ({
      width: isLandscape ? '29%' : '47%',
      height: isLandscape ? '44%' : undefined,
      marginTop: '2%',
      cursor: 'pointer',
    }),
    [isLandscape]
  );
  return (
    <RouterLink to={link} style={linkStyle}>
      <img src={image} alt="" style={imageStyle} />
    </RouterLink>
  );
}
