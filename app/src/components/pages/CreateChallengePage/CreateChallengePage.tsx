import usePwaRedirect from '@/components/hooks/usePwaRedirect';
import { Page } from '@/components/ui/Page';
import Routes from '@/models/Routes';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import React from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { CreateChallengeHeader } from './CreateChallengeHeader';

export function CreateChallengePage() {
  const intl = useIntl();
  const history = useHistory();
  usePwaRedirect();

  const challenge = useChallengeEditorStore((store) => store.challenge);
  const challengeExists = !!challenge;
  React.useEffect(() => {
    if (!challengeExists) {
      //useChallengeEditorStore.getState().setChallenge(createNewChallenge());
      history.replace(Routes.newChallenge);
    }
  }, [challengeExists, history]);

  if (!challengeExists) {
    return null;
  }

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Challenge Editor',
        description: 'Challenge Editor Page title',
      })}
      showTitle={false}
    >
      <CreateChallengeHeader />
    </Page>
  );
}
