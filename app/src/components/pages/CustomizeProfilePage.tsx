import React from 'react';
import { Box, Typography } from '@material-ui/core';

import FlexBox from '../ui/FlexBox';
import { FormattedMessage } from 'react-intl';

import useLoginRedirect from '../hooks/useLoginRedirect';
import { useUser } from '../../state/UserStore';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import { IColor, IUser } from 'infinitris2-models';
import useAuthStore from '../../state/AuthStore';
import { colorsPath, getUserPath } from '../../firebase';
import LoadingSpinner from '../LoadingSpinner';
import { YourBlockPreview } from '../ui/BlockPreview';
import ProductTile from '../ui/ProductTile';

export default function CustomizeProfilePage() {
  useLoginRedirect();

  const user = useUser();
  const userId = useAuthStore().user?.uid;
  const { data: colors } = useCollection<IColor>(colorsPath);

  const { data: fireStoreUserDoc } = useDocument<IUser>(
    userId ? getUserPath(userId) : null
  );

  if (!fireStoreUserDoc?.id || fireStoreUserDoc.id !== userId) {
    // wait for the user profile to load
    return (
      <FlexBox flex={1}>
        <LoadingSpinner />
      </FlexBox>
    );
  }

  return (
    <FlexBox flex={1} justifyContent="flex-start">
      <Typography variant="h1" align="center">
        <FormattedMessage
          defaultMessage="Customize Your Block"
          description="Customize Profile title"
        />
      </Typography>
      <YourBlockPreview user={user} />
      <Typography variant="h2" align="center">
        <FormattedMessage
          defaultMessage="Color"
          description="Customize Profile color header"
        />
      </Typography>
      <FlexBox flexDirection="row" flexWrap="wrap">
        {colors?.map((color) => (
          <FlexBox key={color.id} m={2}>
            <ProductTile>
              <Typography
                style={{
                  color: `#${color.value.toString(16)}`,
                  fontSize: 64,
                }}
              >
                █
              </Typography>
            </ProductTile>
          </FlexBox>
        ))}
      </FlexBox>
      <Box mt={2} />
      <Typography variant="caption" align="center">
        <FormattedMessage
          defaultMessage="Stay tuned - block patterns coming soon!"
          description="Customize Profile stay tuned"
        />
      </Typography>
    </FlexBox>
  );
}
