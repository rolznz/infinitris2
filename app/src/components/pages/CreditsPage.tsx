import React from 'react';
import FlexBox from '../ui/FlexBox';

export function CreditsPage() {
  return (
    <FlexBox flex={1} mx={10}>
      <h1>Credits</h1>
      <p>
        Programming: <a href="https://github.com/rolznz">Roland Bewick</a>
      </p>
      <p>
        Art: <a href="https://rebeccabewick.com">Rebecca Bewick</a>
      </p>
      <p>
        Music: <a href="https://www.youtube.com/user/allanzax">Allan Zax</a>
      </p>

      <p>
        Special Thanks: AL Kong, Rob Hayes, Zorg from TigSource, Sven Obermaier,
        Natalia Golovacheva, Jono Burch, Charles Liu, Nick van der Vis, Seth
        Reid, Eugene van Staden, Linda Pettigrew, Niamh Fitzgerald, Tim Bewick,
        Michał Marcinkowski, Saintpoida
      </p>

      <p>
        Gestures by Jeff Portaro from&nbsp;
        <a
          href="https://www.flaticon.com/authors/pixel-buddha"
          title="Pixel Buddha"
        >
          Pixel Buddha
        </a>
      </p>
    </FlexBox>
  );
}
