import FlexBox from '@/components/ui/FlexBox';
import Typography from '@mui/material/Typography';
import useIngameStore from '@/state/IngameStore';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { SxProps, Theme } from '@mui/material/styles';
import { textShadows } from '@/theme/theme';

const sx: SxProps<Theme> = { textShadow: textShadows.base };

export function SpawnDelayDisplay() {
  console.log('Re-render spawn delay display');
  const simulation = useIngameStore((store) => store.simulation);
  const [renderId, setRenderId] = React.useState(0);

  const spawnDelayDisplayVisible = useIngameStore(
    (store) => store.spawnDelayDisplayVisible
  );
  React.useEffect(() => {
    if (spawnDelayDisplayVisible) {
      setTimeout(() => setRenderId((state) => state + 1), 1000);
    }
  }, [spawnDelayDisplayVisible, renderId]);

  const estimatedSpawnDelaySeconds = Math.ceil(
    (simulation?.controllablePlayer?.estimatedSpawnDelay || 0) / 1000
  );

  if (!spawnDelayDisplayVisible || estimatedSpawnDelaySeconds <= 0) {
    return null;
  }

  return (
    <FlexBox>
      <Typography variant="h2" textAlign="center" sx={sx}>
        <FormattedMessage
          defaultMessage="Next block"
          description="spawn delay display next block"
        />
      </Typography>
      <Typography variant="h1" fontSize={60} sx={sx}>
        {estimatedSpawnDelaySeconds}
      </Typography>
    </FlexBox>
  );
}
