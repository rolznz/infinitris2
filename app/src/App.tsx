import React from 'react';
import useInfinitrisClient from "./client/useInfinitrisClient";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import HomePage from './components/pages/HomePage';
import RoomPage from './components/pages/RoomPage';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import useAppStore from './state/AppStore';
import { Box, ThemeProvider } from '@material-ui/core';
import LobbyPage from './components/pages/LobbyPage';
import theme from './theme';

function App() {
  useInfinitrisClient();
  const appStore = useAppStore();
  if (!appStore.client) {
    return null;
  }
  return (
    <ThemeProvider theme={theme}>
      <Box className="App" display="flex" flexDirection="column" height="100%">
        <Router>
          <Route 
            render={({ location }) => location.pathname.indexOf('/rooms') === 0
                ? null
                : <Header/>}
          />
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route exact path="/lobby">
              <LobbyPage />
            </Route>
            <Route path="/rooms/:id">
              <RoomPage />
            </Route>
          </Switch>
            
          <Route 
            render={({ location }) => location.pathname.indexOf('/rooms') === 0
                ? null
                : <Footer/>}
          />
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
