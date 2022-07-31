import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { dropShadows } from '@/theme/theme';
import { SxProps, Theme } from '@mui/material';
import React from 'react';

type CharacterImageProps = {
  characterId: string;
  thumbnail?: string;
  width: number;
  hasShadow?: boolean;
  strongShadow?: boolean;
};

function _CharacterImage({
  characterId,
  width,
  thumbnail,
  hasShadow,
  strongShadow,
}: CharacterImageProps) {
  const sx: SxProps<Theme> = React.useMemo(
    () => ({
      filter: strongShadow
        ? dropShadows.selected
        : hasShadow
        ? dropShadows.small
        : undefined,
    }),
    [hasShadow, strongShadow]
  );
  return (
    <ProgressiveImage
      width={width}
      height={width}
      sx={sx}
      thumbnail={thumbnail ? `data:image/png;base64,${thumbnail}` : undefined}
      thumbnailFallbackUrl={`${process.env.REACT_APP_IMAGES_ROOT_URL}/characters/${characterId}_thumbnail.png`}
      url={`${process.env.REACT_APP_IMAGES_ROOT_URL}/characters/${characterId}.png`}
    />
  );
}

export const CharacterImage = React.memo(
  _CharacterImage,
  (prevProps, nextProps) =>
    prevProps.characterId === nextProps.characterId &&
    prevProps.width === nextProps.width
);
