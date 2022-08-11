import Box from '@mui/material/Box/Box';
import { SxProps, Theme } from '@mui/material';
import React from 'react';

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  pointerEvents: 'none',
};
const placeholderImageStyle = { ...imageStyle, filter: 'blur(8px)' };

type ProgressiveImageProps = {
  url: string;
  thumbnail?: string;
  thumbnailFallbackUrl?: string;
  width: number;
  height?: number;
  sx?: SxProps<Theme>;
  blur?: boolean;
  thumbnailOnly?: boolean;
};

export function ProgressiveImage({
  sx,
  url,
  thumbnail,
  thumbnailFallbackUrl,
  width,
  height,
  thumbnailOnly = false,
  blur = !thumbnailOnly,
}: ProgressiveImageProps) {
  const [isLoaded, setLoaded] = React.useState(false);
  height = height || width;

  return (
    <Box
      width={width + 'px'}
      height={height + 'px'}
      position="relative"
      flexShrink={0}
      sx={sx}
    >
      {!isLoaded && (thumbnail || thumbnailFallbackUrl) && (
        <img
          src={thumbnail || thumbnailFallbackUrl}
          style={blur ? placeholderImageStyle : imageStyle}
          alt=""
        />
      )}

      {!thumbnailOnly && (
        <img
          src={url}
          style={imageStyle}
          alt=""
          onLoad={() => setLoaded(true)}
        />
      )}
    </Box>
  );
}
