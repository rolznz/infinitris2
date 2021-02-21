import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import AllSetPage from './components/pages/AllSetPage';
import { CreateChallengePage } from './components/pages/CreateChallengePage/CreateChallengePage';
import { LoadChallengePage } from './components/pages/CreateChallengePage/LoadChallengePage';
import HomePage from './components/pages/HomePage';
import LobbyPage from './components/pages/LobbyPage';
import LoginPage from './components/pages/LoginPage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import ProfilePage from './components/pages/ProfilePage';
import RoomPage from './components/pages/RoomPage';
import ControlSettingsPage from './components/pages/SettingsPage/ControlSettingsPage';
import SettingsPage from './components/pages/SettingsPage/SettingsPage';
import SinglePlayerPage from './components/pages/SinglePlayerPage';
import TutorialPage from './components/pages/TutorialPage/TutorialPage';
import TutorialRequiredPage from './components/pages/TutorialRequiredPage';
import { TutorialsPage } from './components/pages/TutorialsPage/TutorialsPage';
import WelcomePage from './components/pages/WelcomePage';
import Routes from './models/Routes';

export default function Router() {
  function OutsideGameElement(props: React.PropsWithChildren<{}>) {
    return (
      <Route
        render={({ location }) => {
          return !(
            (
              location.pathname.startsWith(Routes.tutorials) &&
              location.pathname.length > Routes.tutorials.length + 1
            ) // match /tutorials or /tutorials/ but not /tutorials/<tutorialId>
          ) &&
            !location.pathname.startsWith(Routes.singlePlayer) &&
            !location.pathname.startsWith(Routes.rooms) ? (
            <>{props.children}</>
          ) : null;
        }}
      />
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
        <Route exact path={Routes.settings}>
          <SettingsPage />
        </Route>
        <Route exact path={Routes.controlSettings}>
          <ControlSettingsPage />
        </Route>
        <Route exact path={Routes.login}>
          <LoginPage />
        </Route>
        <Route exact path={Routes.profile}>
          <ProfilePage />
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
        <Route exact path={Routes.tutorials}>
          <TutorialsPage />
        </Route>
        <Route exact path={Routes.createChallenge}>
          <CreateChallengePage />
        </Route>
        <Route exact path={Routes.loadChallenge}>
          <LoadChallengePage />
        </Route>
        <Route path={`${Routes.tutorials}/:id`}>
          <TutorialPage />
        </Route>
        <Route exact path={`${Routes.rooms}/:id`}>
          <RoomPage />
        </Route>
        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
      <OutsideGameElement>
        <Footer />
      </OutsideGameElement>
    </BrowserRouter>
  );
}
