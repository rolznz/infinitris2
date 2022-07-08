import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import FlexBox from '@/components/ui/FlexBox';
import { borderRadiuses } from '@/theme/theme';
import { Typography } from '@mui/material';

export function FullPageCarouselTitle({
  children,
}: React.PropsWithChildren<{}>) {
  const isLandscape = useIsLandscape();
  return (
    <FlexBox
      position="absolute"
      sx={{ backgroundColor: '#0C0D0D44' }}
      borderRadius={borderRadiuses.full}
      py={1}
      px={2}
      top={70}
      left={isLandscape ? 70 : 20}
    >
      <Typography variant="h6" color="white">
        {children}
      </Typography>
    </FlexBox>
  );
}
