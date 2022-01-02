import { Button } from '@mui/material';
import React from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import { Page } from '../ui/Page';
import { FormattedMessage, useIntl } from 'react-intl';

export function SinglePlayerOptionsPage() {
  const intl = useIntl();
  const history = useHistory();
  function startGame() {
    history.push(Routes.singlePlayer); // TODO: add params
  }

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Single Player Options',
        description: 'Single Player Options page title',
      })}
      narrow
    >
      <Button color="primary" variant="contained" onClick={startGame}>
        <FormattedMessage
          defaultMessage="Play"
          description="Single Player Options page - play button"
        />
      </Button>
    </Page>
  );
}
