import FlexBox from '@/components/ui/FlexBox';
import useIngameStore from '@/state/IngameStore';
import { borderRadiuses } from '@/theme/theme';
import isMobile from '@/utils/isMobile';
import TextField from '@mui/material/TextField';
import React from 'react';
import { useIntl } from 'react-intl';

function executeMobileChatAction(cancel: boolean) {
  const followingPlayer = useIngameStore.getState().simulation?.followingPlayer;
  if (
    followingPlayer &&
    followingPlayer.isHuman &&
    followingPlayer.isChatting &&
    isMobile()
  ) {
    followingPlayer.toggleChat(cancel);
  }
}

export function IngameChat() {
  const [isChatOpen, chatMessage, setChatMessage] = useIngameStore((store) => [
    store.isChatOpen,
    store.chatMessage,
    store.setChatMessage,
  ]);
  const intl = useIntl();
  if (!isChatOpen) {
    return null;
  }
  return (
    <FlexBox
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      sx={{ background: '#00000055' }}
    >
      <form
        action=""
        onSubmit={(e) => {
          executeMobileChatAction(false);
          e.preventDefault();
        }}
      >
        <input
          type="submit"
          name="submit"
          style={{ position: 'absolute', top: '-1000px' }}
        />
        <TextField
          variant="filled"
          placeholder={intl.formatMessage({
            defaultMessage: 'Type a message',
            description: 'Ingame chat textbox placeholder',
          })}
          onBlur={() => {
            executeMobileChatAction(true);
          }}
          autoFocus
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          inputProps={{
            style: {
              color: '#ffffff',
              width: 'min(80vw, 600px)',
            },
          }}
          InputProps={{
            disableUnderline: true,
            style: {
              borderRadius: borderRadiuses.base,
              paddingTop: 0,
              paddingBottom: '10px',
            },
          }}
        />
      </form>
    </FlexBox>
  );
}
