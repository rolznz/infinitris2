import FlexBox from '@/components/ui/FlexBox';
import useIngameStore, { MessageLogEntry } from '@/state/IngameStore';
import { borderRadiuses, boxShadows } from '@/theme/theme';
import { Typography } from '@mui/material';
import React from 'react';
import { useEffect } from 'react';
import shallow from 'zustand/shallow';

const messageLife = 5000;

export function MessageLog() {
  const [, forceRerender] = React.useState<object>();
  const [isChatOpen, messageLogEntries] = useIngameStore(
    (store) => [store.isChatOpen, store.messageLogEntries],
    shallow
  );
  useEffect(() => {
    setTimeout(() => {
      forceRerender({});
    }, messageLife);
  }, [messageLogEntries]);
  console.log('Render message log');

  return (
    <FlexBox
      position="absolute"
      bottom="70px"
      left="0px"
      alignItems="flex-start"
      justifyContent="flex-start"
      gap={1}
      height="70vh"
      width="100vw"
      flexDirection="column-reverse"
      px={1}
      pb={1}
      sx={{
        overflowY: 'auto',
        pointerEvents: isChatOpen ? 'all' : 'none',
        userSelect: isChatOpen ? 'text' : 'none',
        zIndex: 1,
      }}
    >
      {messageLogEntries
        .filter(
          (entry) => isChatOpen || Date.now() - entry.createdTime < messageLife
        )
        .reverse()
        .map((entry) => (
          <MessageLogEntryLine
            key={entry.createdTime + entry.message}
            entry={entry}
          />
        ))}
    </FlexBox>
  );
}

type MessageLogEntryLineProps = { entry: MessageLogEntry };

function MessageLogEntryLine({ entry }: MessageLogEntryLineProps): JSX.Element {
  return (
    <FlexBox
      key={entry.createdTime}
      flexDirection="row"
      gap={1}
      boxShadow={boxShadows.small}
      borderRadius={borderRadiuses.base}
      p={1}
      sx={{
        backgroundColor: '#00000055',
      }}
    >
      {entry.nickname && (
        <Typography variant="body1" style={{ color: entry.color }}>
          {entry.nickname}
        </Typography>
      )}
      <Typography style={{ color: '#fff' }}>{entry.message}</Typography>
    </FlexBox>
  );
}
