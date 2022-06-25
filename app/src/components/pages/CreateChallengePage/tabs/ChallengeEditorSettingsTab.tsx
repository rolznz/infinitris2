import { ChallengeEditorSettingsForm } from '@/components/pages/CreateChallengePage/tabs/ChallengeEditorSettingsForm';
import FlexBox from '@/components/ui/FlexBox';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import React from 'react';
//import PublicOffIcon from '@mui/icons-material/PublicOff';
//import FolderIcon from '@mui/icons-material/Folder';
//import SaveIcon from '@mui/icons-material/Save';
//import { FilledIcon } from '@/components/ui/FilledIcon';
//import NoteAddIcon from '@mui/icons-material/NoteAdd';
import shallow from 'zustand/shallow';

//import { ChallengeEditorJson } from '@/components/pages/CreateChallengePage/tabs/ChallengeEditorJson';

export function ChallengeEditorSettingsTab() {
  const [formKey, setFormKey] = React.useState(0);
  const [challenge] = useChallengeEditorStore(
    (store) => [store.challenge, store.setChallenge],
    shallow
  );

  const updateFormKey = React.useCallback(
    () => setFormKey((current) => current + 1),
    [setFormKey]
  );

  if (!challenge) {
    return null;
  }

  return (
    <FlexBox width="100%" height="100%" justifyContent="flex-start">
      <ChallengeEditorSettingsForm
        challenge={challenge}
        updateFormKey={updateFormKey}
        key={formKey.toString()}
      />

      {/* <FormControl>
        <Input
          id="my-input"
          aria-describedby="my-helper-text"
          placeholder="Challenge Title"
          value={challenge.title}
          onChange={(event) =>
            setChallenge({ ...challenge, title: event.target.value })
          }
        />
      </FormControl> */}
      {/*<FlexBox flexDirection="row" gap={1} mt={10}>
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
        </FlexBox>*/}
      {/*TODO: button to export/import challenge that opens prompt*/}
    </FlexBox>
  );
}
