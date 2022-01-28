import FlexBox from '@/components/ui/FlexBox';
import useIngameStore from '@/state/IngameStore';
import { borderColorLight, borderRadiuses } from '@/theme/theme';
import TextField from '@mui/material/TextField';
import React from 'react';
import { useIntl } from 'react-intl';

export function IngameChat() {
  console.log('Render ingame chat');
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
      <TextField
        variant="filled"
        placeholder={intl.formatMessage({
          defaultMessage: 'Type a message',
          description: 'Ingame chat textbox placeholder',
        })}
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
        // InputProps={{
        //   //classes: { input: classes.nicknameInput },
        //   disableUnderline: true,
        //   autoFocus: true,
        //   style: {
        //     backgroundColor: borderColorLight,
        //     borderRadius: 32,
        //     padding: 4,
        //     paddingLeft: 8,
        //     borderColor: '#ffffff44',
        //     borderWidth: 6,
        //     borderStyle: 'solid',
        //     backgroundClip: 'padding-box',
        //     filter: 'drop-shadow(0 0 0.75rem white)',
        //   },
        // }}
      />
    </FlexBox>
  );
}
