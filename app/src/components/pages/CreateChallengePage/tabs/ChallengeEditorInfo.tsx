import FlexBox from '@/components/ui/FlexBox';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import { FormControl, Input, FormHelperText } from '@mui/material';
import React from 'react';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import FolderIcon from '@mui/icons-material/Folder';
import SaveIcon from '@mui/icons-material/Save';
import { FilledIcon } from '@/components/ui/FilledIcon';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import shallow from 'zustand/shallow';

export function ChallengeEditorInfo() {
  const [challenge, setChallenge] = useChallengeEditorStore(
    (store) => [store.challenge, store.setChallenge],
    shallow
  );
  if (!challenge) {
    return null;
  }
  return (
    <FlexBox width="100%" height="100%" justifyContent="flex-start">
      <FormControl>
        <Input
          id="my-input"
          aria-describedby="my-helper-text"
          placeholder="Challenge Title"
          value={challenge.title}
          onChange={(event) =>
            setChallenge({ ...challenge, title: event.target.value })
          }
        />
      </FormControl>
      <FlexBox flexDirection="row" gap={1} mt={10}>
        <FilledIcon>
          <NoteAddIcon />
        </FilledIcon>
        <FilledIcon>
          <FolderIcon />
        </FilledIcon>
        <FilledIcon>
          <SaveIcon />
        </FilledIcon>
        <FilledIcon>
          <PublicOffIcon />
        </FilledIcon>
      </FlexBox>
    </FlexBox>
  );
}
