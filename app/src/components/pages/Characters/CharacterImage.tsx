import { boxShadows, dropShadows } from '@/theme/theme';
import { Box, SxProps, Theme } from '@mui/material';
import React from 'react';

type CharacterImageProps = {
  characterId: string;
  thumbnail?: string;
  width: number;
  hasShadow?: boolean;
};

// TODO: extract to progressive image component
const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  pointerEvents: 'none',
};

const placeholderImageStyle = { ...imageStyle, filter: 'blur(8px)' };

function _CharacterImage({
  characterId,
  width,
  thumbnail,
  hasShadow,
}: CharacterImageProps) {
  const [isLoaded, setLoaded] = React.useState(false);
  const sx: SxProps<Theme> = React.useMemo(
    () => ({
      filter: hasShadow ? dropShadows.small : undefined,
    }),
    [hasShadow]
  );
  return (
    <Box
      width={width + 'px'}
      height={width + 'px'}
      position="relative"
      flexShrink={0}
      sx={sx}
    >
      {!isLoaded && (
        <img
          src={
            thumbnail
              ? `data:image/png;base64,${thumbnail}`
              : `${process.env.REACT_APP_IMAGES_ROOT_URL}/characters/${characterId}_thumbnail.png`
          }
          style={placeholderImageStyle}
          alt=""
        />
      )}

      <img
        src={`${process.env.REACT_APP_IMAGES_ROOT_URL}/characters/${characterId}.png`}
        style={imageStyle}
        alt=""
        onLoad={() => setLoaded(true)}
      />
    </Box>
  );
}

export const CharacterImage = React.memo(
  _CharacterImage,
  (prevProps, nextProps) =>
    prevProps.characterId === nextProps.characterId &&
    prevProps.width === nextProps.width
);
