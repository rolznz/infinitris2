import { Button, Link, TextField, Typography } from '@material-ui/core';
import { IChallenge, parseGrid } from 'infinitris2-models';
import React, { useCallback, useEffect, useState } from 'react';
import { defaultLocale } from '../../../internationalization';

import useLoginRedirect from '../../hooks/useLoginRedirect';
import FlexBox from '../../layout/FlexBox';
import ChallengeGridPreview from '../ChallengesPage/ChallengeGridPreview';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../../models/Routes';
import { FormattedMessage } from 'react-intl';
import { useCopyToClipboard, useLocalStorage } from 'react-use';
import { v4 as uuidv4 } from 'uuid';
import localStorageKeys from '../../../utils/localStorageKeys';
import { set, useDocument } from '@nandorojo/swr-firestore';
import { getChallengePath } from '../../../firebase';
import useAuthStore from '../../../state/AuthStore';
import prettyStringify from '../../../utils/prettyStringify';
import stableStringify from '../../../utils/stableStringify';

function createNewChallenge(userId: string): IChallenge {
  return {
    id: uuidv4(),
    locale: defaultLocale,
    isOfficial: false,
    userId,
    successCriteria: {},
    finishCriteria: {
      emptyGrid: true,
    },
    title: '',
    grid: `
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
0000X0000
0X0000X00
X00X00X0X`.trim(),
  };
}

function getGridError(challenge: IChallenge): string | null {
  try {
    parseGrid(challenge.grid as string);
    return null;
  } catch (e) {
    return e.message;
  }
}

export function CreateChallengePage() {
  const [, copy] = useCopyToClipboard();
  useLoginRedirect();

  const [initialChallenge, setInitialChallenge] = useState<
    IChallenge | undefined
  >();
  const [isSaving, setIsSaving] = useState(false);
  const userId = useAuthStore().user?.uid;

  const [localChallengeGrid, setLocalChallengeGrid] = useLocalStorage<string>(
    localStorageKeys.createChallengeGrid,
    undefined,
    {
      raw: true,
    }
  );

  const [localChallengeInfo, setLocalChallengeInfo] = useLocalStorage<string>(
    localStorageKeys.createChallengeInfo,
    undefined,
    {
      raw: true,
    }
  );

  const resetChallenge = useCallback(
    (initialValue?: IChallenge) => {
      const newInitialChallenge = initialValue || createNewChallenge(userId!);
      setInitialChallenge(newInitialChallenge);
      const { grid, ...challengeWithoutGrid } = newInitialChallenge;
      setLocalChallengeGrid(grid as string);
      setLocalChallengeInfo(prettyStringify(challengeWithoutGrid));
    },
    [userId, setInitialChallenge, setLocalChallengeGrid, setLocalChallengeInfo]
  );

  useEffect(() => {
    if (!localChallengeInfo && userId) {
      resetChallenge();
    }
  }, [localChallengeInfo, userId, resetChallenge]);

  let challenge: IChallenge | undefined;
  let challengeInfoError: string | undefined;
  try {
    challenge = {
      ...JSON.parse(localChallengeInfo || ''),
      grid: localChallengeGrid,
    };
  } catch (e) {
    console.log(localChallengeInfo);
    challengeInfoError = e.message;
  }

  const { data: syncedChallenge } = useDocument<IChallenge>(
    challenge ? getChallengePath(challenge.id) : null
  );

  const gridError = challenge ? getGridError(challenge) : undefined;

  async function saveChallenge() {
    if (!challenge) {
      console.error('Cannot save invalid challenge');
      return;
    }
    const challengePath = getChallengePath(challenge.id);
    setIsSaving(true);
    try {
      await set(challengePath, challenge);
    } catch (e) {
      console.error(e);
      alert('Failed to save challenge, please try again.');
    }
    setIsSaving(false);
  }

  return (
    <FlexBox flex={1}>
      <TextField
        label="Challenge Settings"
        multiline
        fullWidth
        spellCheck={false}
        value={localChallengeInfo}
        onChange={(event) => setLocalChallengeInfo(event.target.value)}
        variant="outlined"
      />
      {challengeInfoError && (
        <Typography variant="caption" color="secondary">
          {challengeInfoError}
        </Typography>
      )}
      <FlexBox flex={1} width="100%" flexDirection="row">
        <TextField
          label="Grid"
          inputProps={{
            style: { fontFamily: 'Courier New' },
          }}
          multiline
          fullWidth
          spellCheck={false}
          value={localChallengeGrid}
          onChange={(event) => setLocalChallengeGrid(event.target.value)}
          variant="outlined"
        />
        {challenge && <ChallengeGridPreview grid={challenge.grid as string} />}
        {gridError && (
          <Typography variant="caption" color="secondary">
            {gridError}
          </Typography>
        )}
      </FlexBox>
      <FlexBox flexDirection="row">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            resetChallenge();
          }}
        >
          <FormattedMessage
            defaultMessage="New Challenge"
            description="New challenge button text"
          />
        </Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={
            stableStringify(challenge) ===
            stableStringify(
              syncedChallenge?.exists ? syncedChallenge : initialChallenge
            )
          }
          onClick={() => {
            resetChallenge(
              syncedChallenge?.exists ? syncedChallenge : initialChallenge
            );
          }}
        >
          <FormattedMessage
            defaultMessage="Reset"
            description="Reset challenge button text"
          />
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            copy(prettyStringify(challenge));
            // TODO: react-toastify notification
          }}
        >
          <FormattedMessage
            defaultMessage="Copy JSON"
            description="Copy challenge JSON button text"
          />
        </Button>
        {!gridError && !challengeInfoError && (
          <Link
            component={RouterLink}
            underline="none"
            to={`${Routes.challenges}/test?json=${encodeURIComponent(
              stableStringify(challenge)
            )}`}
          >
            <Button variant="contained" color="primary">
              <FormattedMessage
                defaultMessage="Test"
                description="Test challenge button text"
              />
            </Button>
          </Link>
        )}
        {!gridError && !challengeInfoError && (
          <Button
            variant="contained"
            color="primary"
            disabled={
              isSaving ||
              (syncedChallenge?.exists &&
                stableStringify(challenge) === stableStringify(syncedChallenge))
            }
            onClick={saveChallenge}
          >
            {syncedChallenge?.exists ? (
              <FormattedMessage
                defaultMessage="Save"
                description="Save challenge button text"
              />
            ) : (
              <FormattedMessage
                defaultMessage="Create"
                description="Create challenge button text"
              />
            )}
          </Button>
        )}
      </FlexBox>
    </FlexBox>
  );
}
