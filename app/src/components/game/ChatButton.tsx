import { Box, IconButton, SvgIcon } from '@mui/material';
import React from 'react';
import { ReactComponent as ChatIcon } from '@/icons/chat.svg';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { colors } from '@/theme/theme';
import FlexBox from '@/components/ui/FlexBox';
import useIngameStore from '@/state/IngameStore';

export default function ChatButton() {
  return (
    <FlexBox style={{ pointerEvents: 'all' }}>
      <IconButton
        style={{}}
        onClick={() => {
          playSound(SoundKey.click);
          const followingPlayer =
            useIngameStore.getState().simulation?.followingPlayer;
          if (followingPlayer && followingPlayer.isControllable) {
            followingPlayer.toggleChat(followingPlayer.isChatting);
          }
        }}
        size="large"
      >
        <SvgIcon
          fontSize="large"
          sx={{
            filter: 'drop-shadow(0 0 0.75rem white)',
            color: colors.white,
          }}
        >
          <ChatIcon />
        </SvgIcon>
      </IconButton>
    </FlexBox>
  );
}
