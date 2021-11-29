import React from 'react';

type CharacterImageProps = {
  characterId: string;
  width: number;
};

// TODO: extract to progressive image component
const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
};

export function CharacterImage({ characterId, width }: CharacterImageProps) {
  const [isLoaded, setLoaded] = React.useState(false);
  return (
    <div
      style={{
        width: width + 'px',
        height: width + 'px',
        position: 'relative',
      }}
    >
      {!isLoaded && (
        <img
          src={`${process.env.REACT_APP_IMAGES_ROOT_URL}/characters/${characterId}_thumbnail.png`}
          style={{ ...imageStyle, filter: 'blur(8px)' }}
          alt=""
        />
      )}

      <img
        src={`${process.env.REACT_APP_IMAGES_ROOT_URL}/characters/${characterId}.png`}
        style={imageStyle}
        alt=""
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
