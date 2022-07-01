import React from 'react';
import useInfinitrisClient from '@/components/hooks/useInfinitrisClient';
import { Theme, ThemeProvider, StyledEngineProvider } from '@mui/material';

import Internationalization from './internationalization/Internationalization';

import { useState } from 'react';
import { useEffect } from 'react';
import useDarkMode from '@/components/hooks/useDarkMode';
import CssBaseline from '@mui/material/CssBaseline';
import FlexBox from '@/components/ui/FlexBox';
import { SnackbarProvider } from 'notistack';
import { darkTheme } from './theme/darkTheme';
import { lightTheme } from './theme/lightTheme';
import { fontFamily } from 'infinitris2-models';

interface AppProps {}

function App({ children }: React.PropsWithChildren<AppProps>) {
  useInfinitrisClient();

  const isDarkMode = useDarkMode();
  const nextTheme = isDarkMode ? darkTheme : lightTheme;
  const [appTheme, setAppTheme] = useState<Theme>(nextTheme);

  useEffect(() => {
    // create a copy of the theme to refresh all components within the app
    setAppTheme({ ...nextTheme });
  }, [nextTheme]);

  return (
    <>
      <CssBaseline />
      <Internationalization>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={appTheme}>
            <FlexBox className="App" width="100%">
              <SnackbarProvider
                maxSnack={3}
                variant="success"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                style={{
                  fontFamily,
                }}
              >
                {children}
              </SnackbarProvider>
            </FlexBox>
          </ThemeProvider>
        </StyledEngineProvider>
      </Internationalization>
    </>
  );
}

export default App;
