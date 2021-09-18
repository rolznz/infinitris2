import React from 'react';
import useInfinitrisClient from './components/hooks/useInfinitrisClient';
import { Box, Theme, ThemeProvider } from '@material-ui/core';
import { lightTheme, darkTheme } from './theme';

import Internationalization from './internationalization/Internationalization';

import { FuegoProvider } from '@nandorojo/swr-firestore';
import { fuego } from './firebase';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';
import { useEffect } from 'react';
import Loader from './components/ui/Loader';
import useDarkMode from './components/hooks/useDarkMode';
import PageRouter from './PageRouter';
import CssBaseline from '@material-ui/core/CssBaseline';
import { DialogManager } from './components/ui/modals/DialogManager';

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
            <Box
              className="App"
              display="flex"
              flexDirection="column"
              height="100%"
            >
              {children}
              <ToastContainer />
            </Box>
          </ThemeProvider>
        </Internationalization>
      </FuegoProvider>
    </>
  );
}

export default App;
