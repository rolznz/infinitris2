import FlexBox from '@/components/ui/FlexBox';
import useIngameStore from '@/state/IngameStore';
import { borderColor, borderRadiuses, boxShadows } from '@/theme/theme';
import React from 'react';
import { useEffect } from 'react';

const messageLife = 5000;

export function MessageLog() {
  const [, forceRerender] = React.useState<object>();
  const [isChatOpen, messageLogEntries] = useIngameStore((store) => [
    store.isChatOpen,
    store.messageLogEntries,
  ]);
  useEffect(() => {
    setTimeout(() => {
      forceRerender({});
    }, messageLife);
  }, [messageLogEntries]);
  console.log('Render message log');

  return (
    <FlexBox
      position="absolute"
      top="70px"
      left="0px"
      alignItems="flex-start"
      justifyContent="flex-start"
      gap={1}
      height="70vh"
      width="100vw"
      flexDirection="column-reverse"
      px={1}
      sx={{
        overflowY: 'auto',
      }}
    >
      {messageLogEntries
        .filter(
          (entry) => isChatOpen || Date.now() - entry.createdTime < messageLife
        )
        .map((entry) => (
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
            <span style={{ color: entry.color }}>{entry.nickname}</span>
            <span style={{ color: '#fff' }}>{entry.message}</span>
          </FlexBox>
        ))}
    </FlexBox>
  );
}
