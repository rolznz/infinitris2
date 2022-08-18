import React from 'react';
import useInfinitrisClient from '@/components/hooks/useInfinitrisClient';

import Internationalization from './internationalization/Internationalization';

import CssBaseline from '@mui/material/CssBaseline';
import FlexBox from '@/components/ui/FlexBox';

import { RateLimitDetector } from '@/components/RateLimitDetector';
import { CustomSnackbarProvider } from '@/components/ui/CustomSnackbarProvider';
import { CustomSWRConfig } from '@/components/CustomSWRConfig';
import Loader from '@/components/ui/Loader';
import PageRouter from '@/PageRouter';
import { AppThemeProvider } from '@/components/AppThemeProvider';

function App() {
  useInfinitrisClient();

  console.log('Render app');

  return (
    <CustomSWRConfig>
      <CssBaseline />
      <Internationalization>
        <AppThemeProvider>
          <FlexBox className="App" width="100%">
            <CustomSnackbarProvider>
              <RateLimitDetector />
              <Loader>
                <PageRouter />
              </Loader>
            </CustomSnackbarProvider>
          </FlexBox>
        </AppThemeProvider>
      </Internationalization>
    </CustomSWRConfig>
  );
}

export default App;
