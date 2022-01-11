import FlexBox from '@/components/ui/FlexBox';

export function GameUI() {
  return (
    <FlexBox
      position="absolute"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      zIndex={1}
    ></FlexBox>
  );
}
