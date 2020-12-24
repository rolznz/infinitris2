import React from 'react';
import useInfinitrisClient from './client/useInfinitrisClient';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import RoomPage from './components/pages/RoomPage';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import useAppStore from './state/AppStore';
import { Box, ThemeProvider } from '@material-ui/core';
import LobbyPage from './components/pages/LobbyPage';
import theme from './theme';
import WelcomePage from './components/pages/WelcomePage';
import Routes from './models/Routes';
import SinglePlayerPage from './components/pages/SinglePlayerPage';
import TutorialPage from './components/pages/TutorialPage';
import TutorialRequiredPage from './components/pages/TutorialRequiredPage';
import AllSetPage from './components/pages/AllSetPage';

function App() {
  useInfinitrisClient();
  const appStore = useAppStore();
  if (!appStore.clientApi) {
    return null;
  }

  const outsideGamePaths = ['/', '/lobby'];
  function OutsideGameElement(props: React.PropsWithChildren<{}>) {
    return (
      <Switch>
        {outsideGamePaths.map((path) => (
          <Route key={path} exact path={path}>
            {props.children}
          </Route>
        ))}
      </Switch>
    );
  }

  // TODO: move router to new file
  return (
    <ThemeProvider theme={theme}>
      <Box className="App" display="flex" flexDirection="column" height="100%">
        <Router>
          <OutsideGameElement>
            <Header />
          </OutsideGameElement>
          <Switch>
            <Route exact path={Routes.home}>
              <HomePage />
            </Route>
            <Route exact path={Routes.welcome}>
              <WelcomePage />
            </Route>
            <Route exact path={Routes.tutorialRequired}>
              <TutorialRequiredPage />
            </Route>
            <Route exact path={Routes.allSet}>
              <AllSetPage />
            </Route>
            <Route exact path={Routes.lobby}>
              <LobbyPage />
            </Route>
            <Route exact path={Routes.singlePlayer}>
              <SinglePlayerPage />
            </Route>
            <Route exact path={`${Routes.tutorials}/:id`}>
              <TutorialPage />
            </Route>
            <Route path={`${Routes.rooms}/:id`}>
              <RoomPage />
            </Route>
          </Switch>
          <OutsideGameElement>
            <Footer />
          </OutsideGameElement>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
