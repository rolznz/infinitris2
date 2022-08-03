import { useUser } from '@/components/hooks/useUser';
import { useSnackbar } from 'notistack';
import React from 'react';
import usePrevious from 'react-use/lib/usePrevious';

export function RateLimitDetector() {
  const user = useUser();
  const writeRate = user.readOnly?.writeRate || 0;
  const prevWriteRate = usePrevious(writeRate);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (prevWriteRate !== undefined && writeRate > prevWriteRate) {
      console.log('Write rate increased', writeRate);
    }
    if (prevWriteRate !== undefined && writeRate < prevWriteRate) {
      console.log('Write rate decreased', writeRate);
      if (prevWriteRate >= 1 && writeRate < 1) {
        enqueueSnackbar('Write rate limit stabilized');
      }
    }
    if (writeRate >= 1) {
      console.error('Write rate limit exceeded', writeRate);
      enqueueSnackbar(
        'Write rate limit exceeded. Please wait a minute and try again.',
        { variant: 'error' }
      );
    }
  }, [writeRate, prevWriteRate, enqueueSnackbar]);

  return null;
}
