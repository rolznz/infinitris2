import React from 'react';
import useInfinitrisClient from './components/hooks/useInfinitrisClient';
import useAppStore from './state/AppStore';
import { Box, Theme, ThemeProvider } from '@material-ui/core';
import { lightTheme, darkTheme } from './theme';

import Internationalization from './internationalization/Internationalization';

import { FuegoProvider } from '@nandorojo/swr-firestore';
import { fuego } from './firebase';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useUser } from './state/UserStore';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useState } from 'react';
import { useEffect } from 'react';
import MusicPlayer from './components/sound/MusicPlayer';
import Loader from './components/ui/Loader';

interface AppProps {}

function App({ children }: React.PropsWithChildren<AppProps>) {
  useInfinitrisClient();
  const appStore = useAppStore();
  const isSystemDarkModeEnabled = useMediaQuery('(prefers-color-scheme: dark)');
  const userAppTheme = useUser().appTheme;
  const isDarkMode =
    userAppTheme === 'dark' ||
    ((!userAppTheme || userAppTheme === 'default') && isSystemDarkModeEnabled);
  const nextTheme = isDarkMode ? darkTheme : lightTheme;
  const [appTheme, setAppTheme] = useState<Theme>(nextTheme);

  useEffect(() => {
    // create a copy of the theme to refresh all components within the app
    setAppTheme({ ...nextTheme });
  }, [nextTheme]);

  if (!appStore.clientApi) {
    return null;
  }

  return (
    <FuegoProvider fuego={fuego}>
      <MusicPlayer />
      <Internationalization>
        <ThemeProvider theme={appTheme}>
          <Box
            className="App"
            display="flex"
            flexDirection="column"
            height="100%"
            style={{
              background: isDarkMode
                ? 'linear-gradient(180deg, rgba(8,27,41,1) 0%, rgba(0,60,67,1) 35%, rgba(10,21,41,1) 100%)'
                : 'linear-gradient(180deg, rgba(30,68,143,1) 0%, rgba(49,168,221,1) 35%, rgba(26,34,82,1) 100%)',
            }}
          >
            <Loader>{children}</Loader>
            <ToastContainer />
          </Box>
        </ThemeProvider>
      </Internationalization>
    </FuegoProvider>
  );
}

export default App;
