import ChatButton from '@/components/game/ChatButton';
import { IngameChat } from '@/components/game/IngameChat';
import { MessageLog } from '@/components/game/MessageLog';
import FlexBox from '@/components/ui/FlexBox';

export function GameUI() {
  console.log('Render Game UI');
  return (
    <FlexBox
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      zIndex={1}
    >
      <ChatButton />
      <IngameChat />
      <MessageLog />
    </FlexBox>
  );
}
