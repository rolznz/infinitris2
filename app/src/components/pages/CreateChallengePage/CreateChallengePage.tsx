import { Button, Link, TextField } from '@material-ui/core';
import { ITutorial } from 'infinitris2-models';
import React from 'react';
import { defaultLocale } from '../../../internationalization';
import useDemo from '../../hooks/useDemo';
import useLoginRedirect from '../../hooks/useLoginRedirect';
import FlexBox from '../../layout/FlexBox';
import TutorialGridPreview from '../TutorialsPage/TutorialGridPreview';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../../models/Routes';
import { FormattedMessage } from 'react-intl';

export function CreateChallengePage() {
  useLoginRedirect();
  useDemo();
  // TODO: store challenge in local storage when not saved (or has changes)
  const [challenge, setChallenge] = React.useState<ITutorial>({
    id: '',
    locale: defaultLocale,
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
  });

  // TODO: generate ID
  // TODO: parse and check for errors here
  // TODO: preview/test button
  // TODO: tutorial name
  // TODO: tutorial help

  // TODO: publish

  const challengeWithoutGrid = {
    ...challenge,
  };
  delete challengeWithoutGrid.grid;

  return (
    <FlexBox flex={1}>
      <TextField
        label="Challenge JSON"
        multiline
        fullWidth
        spellCheck={false}
        defaultValue={JSON.stringify(challengeWithoutGrid, undefined, ' ')}
        onChange={(event) =>
          setChallenge({
            ...JSON.parse(event.target.value),
            grid: challenge.grid,
          })
        }
        variant="outlined"
      />
      <TextField
        label="Grid JSON"
        inputProps={{
          style: { fontFamily: 'Courier New' },
        }}
        multiline
        fullWidth
        spellCheck={false}
        defaultValue={challenge.grid as string}
        onChange={(event) =>
          setChallenge({
            ...challenge,
            grid: event.target.value,
          })
        }
        variant="outlined"
      />
      <TutorialGridPreview grid={challenge.grid as string} />
      <Link
        component={RouterLink}
        underline="none"
        to={`${Routes.tutorials}/test?json=${encodeURIComponent(
          JSON.stringify(challenge)
        )}`}
      >
        <Button variant="contained" color="primary">
          <FormattedMessage
            defaultMessage="Test"
            description="Test challenge button text"
          />
        </Button>
      </Link>
    </FlexBox>
  );
}
