import React from 'react';

type CharacterImageProps = {
  characterId: string;
  width: number;
};

export function CharacterImage({ characterId, width }: CharacterImageProps) {
  return (
    <img
      src={`${process.env.REACT_APP_IMAGES_ROOT_URL}/characters/faces/${characterId}.png`}
      style={{
        width: width + 'px',
        height: 'auto',
        maxWidth: '100%',
      }}
    />
  );
}
