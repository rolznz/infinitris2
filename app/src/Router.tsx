import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import AllSetPage from './components/pages/AllSetPage';
import HomePage from './components/pages/HomePage';
import LobbyPage from './components/pages/LobbyPage';
import RoomPage from './components/pages/RoomPage';
import SinglePlayerPage from './components/pages/SinglePlayerPage';
import TutorialPage from './components/pages/TutorialPage';
import TutorialRequiredPage from './components/pages/TutorialRequiredPage';
import WelcomePage from './components/pages/WelcomePage';
import Routes from './models/Routes';

export default function Router() {
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

  return (
    <BrowserRouter>
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
        <Route exact path={`${Routes.rooms}/:id`}>
          <RoomPage />
        </Route>
      </Switch>
      <OutsideGameElement>
        <Footer />
      </OutsideGameElement>
    </BrowserRouter>
  );
}
