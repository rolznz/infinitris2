import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Page } from '../ui/Page';

export function CreditsPage() {
  return (
    <Page
      title={
        <FormattedMessage
          defaultMessage="Credits"
          description="Credits Header"
        />
      }
    >
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
        Michał Marcinkowski, Saintpoida, Jonathan Derrough
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
    </Page>
  );
}
