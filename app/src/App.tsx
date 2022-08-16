import React from 'react';
import useInfinitrisClient from '@/components/hooks/useInfinitrisClient';
import { Theme, ThemeProvider, StyledEngineProvider } from '@mui/material';

import Internationalization from './internationalization/Internationalization';

import { useState } from 'react';
import { useEffect } from 'react';
import useDarkMode from '@/components/hooks/useDarkMode';
import CssBaseline from '@mui/material/CssBaseline';
import FlexBox from '@/components/ui/FlexBox';
import { darkTheme } from './theme/darkTheme';
import { lightTheme } from './theme/lightTheme';

import { RateLimitDetector } from '@/components/RateLimitDetector';
import { CustomSnackbarProvider } from '@/components/ui/CustomSnackbarProvider';
import { CustomSWRConfig } from '@/components/CustomSWRConfig';
import Loader from '@/components/ui/Loader';
import PageRouter from '@/PageRouter';

function App() {
  useInfinitrisClient();

  const isDarkMode = useDarkMode();
  const nextTheme = isDarkMode ? darkTheme : lightTheme;
  const [appTheme, setAppTheme] = useState<Theme>(nextTheme);

  useEffect(() => {
    // create a copy of the theme to refresh all components within the app
    setAppTheme({ ...nextTheme });
  }, [nextTheme]);

  console.log('Render app');

  return (
    <CustomSWRConfig>
      <CssBaseline />
      <Internationalization>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={appTheme}>
            <FlexBox className="App" width="100%">
              <CustomSnackbarProvider>
                <RateLimitDetector />
                <Loader>
                  <PageRouter />
                </Loader>
              </CustomSnackbarProvider>
            </FlexBox>
          </ThemeProvider>
        </StyledEngineProvider>
      </Internationalization>
    </CustomSWRConfig>
  );
}

export default App;
