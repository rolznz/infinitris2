import { IconButton, SvgIcon } from '@mui/material';
import React from 'react';
import { ReactComponent as ChatIcon } from '@/icons/chat.svg';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { colors, dropShadows, boxShadows } from '@/theme/theme';
import FlexBox from '@/components/ui/FlexBox';
import useIngameStore from '@/state/IngameStore';

export default function ChatButton() {
  return (
    <FlexBox style={{ pointerEvents: 'all' }}>
      <IconButton
        style={{
          boxShadow: boxShadows.small,
        }}
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
            filter: dropShadows.small,
            color: colors.white,
          }}
        >
          <ChatIcon />
        </SvgIcon>
      </IconButton>
    </FlexBox>
  );
}
