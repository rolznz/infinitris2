import React from 'react';
import useInfinitrisClient from './components/hooks/useInfinitrisClient';
import useAppStore from './state/AppStore';
import { Box, ThemeProvider } from '@material-ui/core';
import theme from './theme';

import Router from './Router';
import Internationalization from './internationalization/Internationalization';

function App() {
  useInfinitrisClient();
  const appStore = useAppStore();
  if (!appStore.clientApi) {
    return null;
  }

  return (
    <Internationalization>
      <ThemeProvider theme={theme}>
        <Box
          className="App"
          display="flex"
          flexDirection="column"
          height="100%"
        >
          <Router />
        </Box>
      </ThemeProvider>
    </Internationalization>
  );
}

export default App;
