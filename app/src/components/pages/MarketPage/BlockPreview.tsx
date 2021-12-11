import FlexBox from '@/components/ui/FlexBox';
import { borderRadiuses, boxShadows } from '@/theme/theme';
import { DocumentSnapshot } from 'firebase/firestore';
import { getBorderColor, ICharacter } from 'infinitris2-models';
import React from 'react';
import { useWindowSize } from 'react-use';

type BlockPreviewProps = {
  character: DocumentSnapshot<ICharacter>;
};

export function BlockPreview({ character }: BlockPreviewProps) {
  const windowSize = useWindowSize();
  const size =
    (Math.min(windowSize.width, windowSize.height) - windowSize.width * 0.15) /
    5;

  return (
    <FlexBox
      position="relative"
      width={size}
      height={size * 4}
      style={{
        backgroundColor: character.data()!.color,
        borderRadius: borderRadiuses.lg,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          border: `${size * 0.1}px solid ${getBorderColor(
            character.data()!.color
          )}`,
          boxShadow: boxShadows.small,
          borderRadius: borderRadiuses.lg,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          background: `url(${process.env.REACT_APP_IMAGES_ROOT_URL}/patterns/${
            character.data()!.patternFilename
          })`,
          backgroundRepeat: 'repeat',
          backgroundSize: 256,
          pointerEvents: 'none',
          boxShadow: boxShadows.small,
          borderRadius: borderRadiuses.lg,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -size * 0.35,
          right: -size * 0.35,
          width: size * 1.7,
          height: size * 1.7,
          background: `url(${process.env.REACT_APP_IMAGES_ROOT_URL}/faces/${character.id}.png)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          pointerEvents: 'none',
        }}
      />
    </FlexBox>
  );
}
