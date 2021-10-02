import React from 'react';
import useInfinitrisClient from './components/hooks/useInfinitrisClient';
import { Theme, ThemeProvider } from '@material-ui/core';
import { lightTheme, darkTheme } from './theme';

import Internationalization from './internationalization/Internationalization';

import { FuegoProvider } from '@nandorojo/swr-firestore';
import { fuego } from './firebase';
import { useState } from 'react';
import { useEffect } from 'react';
import useDarkMode from './components/hooks/useDarkMode';
import CssBaseline from '@material-ui/core/CssBaseline';
import FlexBox from './components/ui/FlexBox';
import { Toasts } from './components/ui/Toasts';

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
      <FuegoProvider fuego={fuego}>
        <Internationalization>
          <ThemeProvider theme={appTheme}>
            <FlexBox className="App" height="100%">
              {children}
              <Toasts />
            </FlexBox>
          </ThemeProvider>
        </Internationalization>
      </FuegoProvider>
    </>
  );
}

export default App;
