import React from 'react';
import useInfinitrisClient from './components/hooks/useInfinitrisClient';
import useAppStore from './state/AppStore';
import { Box, ThemeProvider } from '@material-ui/core';
import { lightTheme, darkTheme } from './theme';

import Internationalization from './internationalization/Internationalization';

import { FuegoProvider } from '@nandorojo/swr-firestore';
import { fuego } from './firebase';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useUser } from './state/UserStore';
import useMediaQuery from '@material-ui/core/useMediaQuery';

interface AppProps {}

function App({ children }: React.PropsWithChildren<AppProps>) {
  useInfinitrisClient();
  const appStore = useAppStore();
  const isDarkModeEnabled = useMediaQuery('(prefers-color-scheme: dark)');
  const userAppTheme = useUser().appTheme;
  if (!appStore.clientApi) {
    return null;
  }

  return (
    <FuegoProvider fuego={fuego}>
      <Internationalization>
        <ThemeProvider
          theme={
            userAppTheme
              ? userAppTheme === 'dark'
                ? darkTheme
                : lightTheme
              : isDarkModeEnabled
              ? darkTheme
              : lightTheme
          }
        >
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
  );
}

export default App;
