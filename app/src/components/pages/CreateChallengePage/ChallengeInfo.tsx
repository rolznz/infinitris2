import FlexBox from '@/components/ui/FlexBox';
import { FormControl, Input, FormHelperText } from '@mui/material';
import React from 'react';

export function ChallengeInfo() {
  return (
    <FlexBox>
      <FormControl>
        <Input
          id="my-input"
          aria-describedby="my-helper-text"
          placeholder="Challenge Title"
        />
      </FormControl>
      Load Save Publish Advanced mode
    </FlexBox>
  );
}
