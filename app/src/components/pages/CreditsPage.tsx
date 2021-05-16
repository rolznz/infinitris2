import React from 'react';
import FlexBox from '../ui/FlexBox';

export function CreditsPage() {
  return (
    <FlexBox flex={1} mx={10}>
      <h1>Credits</h1>
      <p>
        Created by <a href="https://github.com/rolznz">rolznz</a>
      </p>
      <p>
        Icons made by{' '}
        <a
          href="https://www.flaticon.com/authors/pixel-buddha"
          title="Pixel Buddha"
        >
          Pixel Buddha
        </a>{' '}
        obtained from{' '}
        <a href="https://www.flaticon.com/" title="Flaticon">
          www.flaticon.com
        </a>{' '}
        and/or other websites (Medals, Hand Gestures)
      </p>
    </FlexBox>
  );
}
