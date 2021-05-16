import { Box, Typography } from '@material-ui/core';
import { IUser } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import FlexBox from './FlexBox';

interface IBlockPreviewProps {
  user: IUser;
}

export default function BlockPreview({ user }: IBlockPreviewProps) {
  return (
    <Typography
      style={{
        color: `#${user.color.toString(16)}`,
      }}
    >
      █
    </Typography>
  );
}

export function YourBlockPreview({ user }: IBlockPreviewProps) {
  return (
    <FlexBox flexDirection="row">
      <Typography>
        <FormattedMessage
          defaultMessage="Your Block"
          description="Your Block"
        />
      </Typography>
      <Box ml={1} />
      <BlockPreview user={user} />
    </FlexBox>
  );
}
