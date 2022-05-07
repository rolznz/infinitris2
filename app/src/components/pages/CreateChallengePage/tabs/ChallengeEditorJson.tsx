import FlexBox from '@/components/ui/FlexBox';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import { zIndexes } from '@/theme/theme';
import prettyStringify from '@/utils/prettyStringify';
import TextField from '@mui/material/TextField';
import React from 'react';
//import useWindowSize from 'react-use/lib/useWindowSize';
import shallow from 'zustand/shallow';
//import { FittedChallengeGridPreview } from '../../ChallengesPage/ChallengeGridPreview';

// TODO: consder removing. This UI is bad on all screens, users should not be able to manually edit the JSON anyway.
export function ChallengeEditorJson() {
  //const windowSize = useWindowSize();
  //const [hasError, set]
  const [challenge, setChallenge] = useChallengeEditorStore(
    (store) => [store.challenge, store.setChallenge],
    shallow
  );
  if (!challenge) {
    return null;
  }

  return (
    <FlexBox
      width="100%"
      justifyContent="flex-start"
      height="100%"
      flexDirection="row"
      flexWrap="wrap"
      position="relative"
    >
      <TextField
        label="Challenge JSON"
        multiline
        fullWidth
        disabled={challenge.isPublished}
        spellCheck={false}
        defaultValue={prettyStringify(challenge)}
        onChange={(event) => {
          try {
            setChallenge(JSON.parse(event.target.value));
          } catch (error) {
            // TODO: maintain error across challenge editor state
            console.error(error);
          }
        }}
        inputProps={{
          style: {
            height: '100%',
            overflow: 'unset',
          },
        }}
        InputProps={{
          style: {
            height: '100%',
          },
        }}
        style={{
          height: '50vh',
          width: '100%',
          zIndex: zIndexes.above,
        }}
        variant="outlined"
      />
      {/*<FlexBox
        flex={1}
        sx={{
          position: isLandscape ? undefined : 'absolute',
          top: isLandscape ? undefined : 0,
          right: isLandscape ? undefined : 0,
          opacity: isLandscape ? undefined : 0.5,
        }}
      >
        <FittedChallengeGridPreview
          grid={challenge.grid}
          maxWidth={windowSize.width * (isLandscape ? 0.45 : 0.1)}
          maxHeight={windowSize.height * (isLandscape ? 0.8 : 0.1)}
        />
      </FlexBox>*/}
    </FlexBox>
  );
}
