import React from 'react';

export default function TapListener(): [boolean, React.FunctionComponent] {
  const [hasTapped, setHasTapped] = React.useState(false);
  function TapListener() {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 99,
        }}
        onTouchEnd={() => setHasTapped(true)}
      />
    );
  }

  return [hasTapped, TapListener];
}
