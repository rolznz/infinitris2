import React from 'react';
import useInfinitrisClient from './components/hooks/useInfinitrisClient';
import { Theme, ThemeProvider, StyledEngineProvider } from '@mui/material';
import { lightTheme, darkTheme } from './theme';

import Internationalization from './internationalization/Internationalization';

import { useState } from 'react';
import { useEffect } from 'react';
import useDarkMode from './components/hooks/useDarkMode';
import CssBaseline from '@mui/material/CssBaseline';
import FlexBox from './components/ui/FlexBox';
import { Toasts } from './components/ui/Toasts';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

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
            <FlexBox className="App">
              {children}
              <Toasts />
            </FlexBox>
          </ThemeProvider>
        </StyledEngineProvider>
      </Internationalization>
    </>
  );
}

export default App;
