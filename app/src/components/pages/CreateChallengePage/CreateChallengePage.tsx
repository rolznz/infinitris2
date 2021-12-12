/*import { Box, Button, Link, TextField, Typography } from '@mui/material';
import {
  ChallengeCellType,
  CreatableChallenge,
  getChallengePath,
  IChallenge,
  parseGrid,
} from 'infinitris2-models';
import React, { useCallback, useEffect, useState } from 'react';
import { defaultLocale } from '../../../internationalization';

import useLoginRedirect from '../../hooks/useLoginRedirect';
import FlexBox from '../../ui/FlexBox';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../../models/Routes';
import { FormattedMessage, useIntl } from 'react-intl';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import localStorageKeys from '../../../utils/localStorageKeys';
import { useDocument } from 'swr-firestore';
import useAuthStore from '../../../state/AuthStore';
import prettyStringify from '../../../utils/prettyStringify';
import stableStringify from '../../../utils/stableStringify';
import ChallengeGridPreview from '../ChallengesPage/ChallengeGridPreview';
import { toast } from 'react-toastify';
import useForcedRedirect from '../../hooks/useForcedRedirect';
import { getCellFillColor } from '../../../utils/getCellFillColor';
import { detailedDiff } from 'deep-object-diff';
import { useUser } from '../../../state/UserStore';
import removeUndefinedValues from '@/utils/removeUndefinedValues';
import { WithId } from '@/models/WithId';

function removeSwrFields(challenge?: IChallenge): IChallenge | undefined {
  if (!challenge) {
    return undefined;
  }
  const cleaned = { ...challenge } as any;
  delete cleaned.exists;
  delete cleaned.hasPendingWrites;
  return cleaned;
}

function createNewChallenge(userId: string): WithId<IChallenge> {
  return {
    id: uuidv4(),
    locale: defaultLocale,
    isOfficial: false,
    isPublished: false,
    rewardCriteria: {},
    finishCriteria: {
      //finishChallengeCellFilled: true,
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
X00X00X0X
FFFFFFFFF`.trim(),
    created: false,
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
  const intl = useIntl();
  const [, copy] = useCopyToClipboard();
  useLoginRedirect();
  useForcedRedirect();

  const [isSaving, setIsSaving] = useState(false);
  const userId = useAuthStore().user?.uid;
  const user = useUser();

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

  let challenge: WithId<IChallenge> | undefined;
  let challengeInfoError: string | undefined;
  try {
    challenge = {
      ...JSON.parse(localChallengeInfo || ''),
      grid: localChallengeGrid,
    };
  } catch (e) {
    console.error('Failed to parse challenge', localChallengeInfo);
    challengeInfoError = e.message;
    challenge = undefined;
  }

  const [initialChallenge, setInitialChallenge] = useState<
    WithId<IChallenge> | undefined
  >(challenge);

  const resetChallenge = useCallback(
    (initialValue?: WithId<IChallenge>) => {
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

  const { data: syncedChallenge } = useDocument<IChallenge>(
    challenge ? getChallengePath(challenge.id) : null
  );

  const gridError = challenge ? getGridError(challenge) : undefined;

  function publishChallenge() {
    if (!challenge) {
      return;
    }
    challenge = {
      ...challenge,
      isPublished: true,
    };
    const { grid, ...challengeWithoutGrid } = challenge;
    setLocalChallengeInfo(prettyStringify(challengeWithoutGrid));
    saveChallenge();
  }

  async function saveChallenge() {
    if (!challenge) {
      console.error('Cannot save invalid challenge');
      return;
    }
    const challengePath = getChallengePath(challenge.id);
    setIsSaving(true);
    try {
      // NB: when updating this list, also update firestore rules
      const challengeToSave: CreatableChallenge = {
        description: challenge.description,
        finishCriteria: challenge.finishCriteria,
        firstBlockLayoutId: challenge.firstBlockLayoutId,
        grid: challenge.grid,
        isMandatory: challenge.isMandatory,
        isOfficial: challenge.isOfficial,
        isPublished: challenge.isPublished,
        locale: challenge.locale,
        priority: challenge.priority,
        simulationSettings: challenge.simulationSettings,
        rewardCriteria: challenge.rewardCriteria,
        title: challenge.title,
        created: false, // FIXME: omit when updating
      };

      await set(challengePath, removeUndefinedValues(challengeToSave), {
        merge: true,
      });
      await revalidateDocument(challengePath);
    } catch (e) {
      console.error(e);
      alert(`Failed to save challenge\n${e.message}`);
    }
    setIsSaving(false);
  }

  const isPublished = syncedChallenge?.exists && syncedChallenge?.isPublished;

  return (
    <FlexBox flex={1} padding={4}>
      {syncedChallenge && isPublished && (
        <FlexBox>
          <FormattedMessage
            defaultMessage="This challenge is published and can no longer be edited."
            description="Challenge published text"
          />
          <Box mb={1} />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              resetChallenge({
                ...syncedChallenge,
                isPublished: false,
                id: uuidv4(),
              });
            }}
          >
            <FormattedMessage
              defaultMessage="Clone Challenge"
              description="Clone challenge button text"
            />
          </Button>
          <Box mb={1} />
        </FlexBox>
      )}
      <FlexBox flex={1} flexDirection="row" width="100%">
        <FlexBox flex={1}>
          <TextField
            label="Challenge Settings"
            multiline
            fullWidth
            disabled={isPublished}
            spellCheck={false}
            value={localChallengeInfo}
            onChange={(event) => setLocalChallengeInfo(event.target.value)}
            inputProps={{
              style: {
                height: '20vh',
                overflow: 'unset',
              },
            }}
            variant="outlined"
          />
          {challengeInfoError && (
            <Typography variant="caption" color="secondary">
              {challengeInfoError}
            </Typography>
          )}
          <Box my={1} />
          <TextField
            label="Grid"
            inputProps={{
              style: {
                fontFamily: 'Courier New',
                height: '30vh',
                overflow: 'unset',
              },
            }}
            multiline
            fullWidth
            disabled={isPublished}
            spellCheck={false}
            value={localChallengeGrid}
            onChange={(event) => setLocalChallengeGrid(event.target.value)}
            variant="outlined"
          />
          <FlexBox
            flexDirection="row"
            flexWrap="wrap"
            my={1}
            style={{ backgroundColor: '#666' }}
          >
            {Object.entries(ChallengeCellType).map((entry) => (
              <Box mx={1} key={entry[0]}>
                <Typography
                  key={entry[0]}
                  variant="caption"
                  style={{ color: getCellFillColor(entry[1]) }}
                >
                  {entry[0]}: {entry[1]}
                </Typography>
              </Box>
            ))}
          </FlexBox>
        </FlexBox>
        <FlexBox flex={1}>
          {challenge && (
            <ChallengeGridPreview grid={challenge.grid as string} />
          )}
          {gridError && (
            <Typography variant="caption" color="secondary">
              {gridError}
            </Typography>
          )}
        </FlexBox>
      </FlexBox>
      <FlexBox flexDirection="row" justifyContent="space-between" width="100%">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            alert(`Load existing challenges to see examples.
- You can edit, save and test a level privately. A level will only be visible to other users once it has been PUBLISHED.
- For user safety, a challenge can only be published once. Once published, it cannot be edited. Therefore, please TEST that you can actually complete the challenge for all medals, and give your challenge a good name before publishing.
- Each challenge must have "finishCriteria" (How the level will be ended. This can be a maximum number of blocks placed, lines cleared, touching a "Finish" cell, clearing the entire grid, etc.)
- Each challenge must have "successCriteria" (Determines if the player wins or loses, and what medal they receive. You can use the "all" field to set standard success conditions, and then modify bronze/silver/gold to override the difficulty for that medal)
- Each challenge must have a unique ID and must match your user ID in order to be created.
- More questions? please create an issue on github or send an email to infinitris2@googlegroups.com.
`);
          }}
        >
          <FormattedMessage
            defaultMessage="Help"
            description="Help button text"
          />
        </Button>
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
            stableStringify(removeSwrFields(challenge)) ===
            stableStringify(
              removeSwrFields(
                syncedChallenge?.exists ? syncedChallenge : initialChallenge
              )
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
            toast(
              intl.formatMessage({
                defaultMessage: 'Challenge copied to clipboard',
                description: 'Challenge copied to clipboard toast message',
              })
            );
          }}
        >
          <FormattedMessage
            defaultMessage="Export"
            description="Export JSON button text"
          />
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            const receivedJson = window.prompt(
              intl.formatMessage({
                defaultMessage: 'Enter challenge JSON',
                description: 'Enter challenge JSON dialog message',
              })
            );
            if (receivedJson) {
              const importedChallenge = JSON.parse(receivedJson);
              // TODO: validate imported challenge
              resetChallenge(importedChallenge);
              toast(
                intl.formatMessage({
                  defaultMessage: 'Challenge imported successfully',
                  description: 'Challenge imported toast message',
                })
              );
            }
          }}
        >
          <FormattedMessage
            defaultMessage="Import"
            description="Import JSON button text"
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
                stableStringify(removeSwrFields(challenge)) ===
                  stableStringify(removeSwrFields(syncedChallenge)))
            }
            onClick={saveChallenge}
          >
            <FormattedMessage
              defaultMessage="Save"
              description="Save challenge button text"
            />
          </Button>
        )}
        {!gridError &&
          !challengeInfoError &&
          syncedChallenge?.exists &&
          !syncedChallenge.isPublished && (
            <Button
              variant="contained"
              color="primary"
              disabled={isSaving}
              onClick={() => {
                if (user.readOnly.coins <= 0) {
                  alert(
                    intl.formatMessage({
                      defaultMessage:
                        'You do not have enough coins to publish. Try again in 24 hours.',
                      description: 'Not enough coins to publish alert message',
                    })
                  );
                  return;
                }
                window.confirm(
                  intl.formatMessage({
                    defaultMessage:
                      'Are you sure you want to publish? Once published, this challenge will become visible and can no longer be edited. Publishing will cost one credit (renewed daily)',
                    description: 'Publish challenge button confirmation',
                  })
                ) && publishChallenge();
              }}
            >
              <FormattedMessage
                defaultMessage="Publish"
                description="Publish button text"
              />
            </Button>
          )}
      </FlexBox>
      {challenge && (
        <Typography variant="caption" color="secondary">
          {JSON.stringify(
            detailedDiff(
              removeSwrFields(challenge) as IChallenge,
              removeSwrFields(
                (syncedChallenge?.exists
                  ? syncedChallenge
                  : initialChallenge) || challenge
              ) as IChallenge
            )
          )}
        </Typography>
      )}
    </FlexBox>
  );
}*/

import FlexBox from '@/components/ui/FlexBox';
import { Page } from '@/components/ui/Page';
import React from 'react';
import { useIntl } from 'react-intl';
import { CreateChallengeHeader } from './CreateChallengeHeader';

export function CreateChallengePage() {
  const intl = useIntl();
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
