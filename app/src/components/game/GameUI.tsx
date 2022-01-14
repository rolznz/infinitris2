import { IngameChat } from '@/components/game/IngameChat';
import FlexBox from '@/components/ui/FlexBox';
import useIngameStore from '@/state/IngameStore';

export function GameUI() {
  const ingameStore = useIngameStore();
  return (
    <FlexBox
      position="absolute"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      zIndex={1}
    >
      {ingameStore.isChatOpen && <IngameChat />}
    </FlexBox>
  );
}
