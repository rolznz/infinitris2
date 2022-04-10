import React from 'react';
import { Route, Switch, BrowserRouter, useLocation } from 'react-router-dom';
import AllSetPage from '@/components/pages/AllSetPage';
import { CreateChallengePage } from '@/components/pages/CreateChallengePage/CreateChallengePage';
import { LoadChallengePage } from '@/components/pages/CreateChallengePage/LoadChallengePage';
import LobbyPage from '@/components/pages/LobbyPage/LobbyPage';
import LoginPage from '@/components/pages/LoginPage';
import { NotFoundPage } from '@/components/pages/NotFoundPage';
import ProfilePage from '@/components/pages/ProfilePage/ProfilePage';
import RoomPage from '@/components/pages/RoomPage';
import ControlSettingsPage from '@/components/pages/SettingsPage/ControlSettingsPage';
import SettingsPage from '@/components/pages/SettingsPage/SettingsPage';
import ChallengePage from '@/components/pages/ChallengePage/ChallengePage';
import ChallengeRequiredPage from '@/components/pages/ChallengeRequiredPage';
import { ChallengesPage } from '@/components/pages/ChallengesPage/ChallengesPage';
import WelcomePage from '@/components/pages/WelcomePage';
import Routes from './models/Routes';
import { CreditsPage } from '@/components/pages/CreditsPage/CreditsPage';
import { PrivacyPolicyPage } from '@/components/pages/PrivacyPolicyPage';
import EarnCreditsPage from '@/components/pages/EarnCreditsPage';
import ScoreboardPage from '@/components/pages/ScoreboardPage/ScoreboardPage';
import AffiliateProgramPage from '@/components/pages/AffiliateProgramPage/AffiliateProgramPage';
import { ComingSoonPage } from '@/components/pages/ComingSoonPage';
import { HomePageBackground } from '@/components/pages/HomePage/HomePageBackground';
import HamburgerMenuButton from '@/components/ui/HamburgerMenu/HamburgerMenuButton';
import { TermsOfServicePage } from '@/components/pages/TermsOfServicePage';
import { DialogManager } from '@/components/ui/drawers/DialogManager';
import AboutPage from '@/components/pages/AboutPage/AboutPage';
import DonatePage from '@/components/pages/AboutPage/DonatePage';
import MarketPage from '@/components/pages/MarketPage/MarketPage';
import MarketCharacterPage from '@/components/pages/MarketPage/MarketCharacterPage';
import BackButton from '@/components/ui/BackButton';
import useAffiliateLinkRef from '@/components/hooks/useAffiliateLinkRef';
import PlayPage from '@/components/pages/PlayPage/PlayPage';
import { PwaPage } from '@/components/pages/PwaPage/PwaPage';
import { HomePage } from '@/components/pages/HomePage/HomePage';
import { SinglePlayerOptionsPage } from '@/components/pages/SinglePlayerPage/SinglePlayerOptionsPage';
import SinglePlayerPage from '@/components/pages/SinglePlayerPage/SinglePlayerPage';
import { SinglePlayerGameModePickerPage } from '@/components/pages/SinglePlayerPage/SinglePlayerGameModePickerPage';
import { RoomInfoPage } from '@/components/pages/RoomInfoPage';

function OutsideGameElement(props: React.PropsWithChildren<{}>) {
  return (
    <Route
      render={({ location }) => {
        return !(
          (
            location.pathname.startsWith(Routes.challenges) &&
            location.pathname.length > Routes.challenges.length + 1
          ) // match /challenges or /challenges/ but not /challenges/<challengeId>
        ) &&
          !location.pathname.startsWith(Routes.singlePlayerPlay) &&
          (!location.pathname.startsWith(Routes.rooms) ||
            location.pathname.endsWith('/info')) ? (
          <>{props.children}</>
        ) : null;
      }}
    />
  );
}

type PageAnimationType = 'slideup';

type RouteProps = React.PropsWithChildren<{
  exact?: boolean;
  path?: string;
  animation?: PageAnimationType;
}>;

export default function PageRouter() {
  return (
    <BrowserRouter>
      <RouterContents />
    </BrowserRouter>
  );
}

let lastPopStateTime = 0;
window.onpopstate = () => {
  lastPopStateTime = Date.now();
};

function RouterContents() {
  useAffiliateLinkRef(); // depends on location
  const location = useLocation();
  // only scroll to 0,0 on new page, not on back
  React.useEffect(() => {
    if (Date.now() - lastPopStateTime > 1000) {
      window.scrollTo(0, 0);
    }
  }, [location]);
  return (
    <>
      <BackButton />
      <DialogManager />
      <OutsideGameElement>
        <HamburgerMenuButton />
        {/*<Header />*/}
      </OutsideGameElement>
      <Switch location={location}>
        <Route exact path={Routes.home}>
          <HomePageBackground>
            <HomePage />
          </HomePageBackground>
        </Route>
        <Route exact path={Routes.credits}>
          <CreditsPage />
        </Route>
        <Route exact path={Routes.about}>
          <AboutPage />
        </Route>
        <Route exact path={Routes.termsOfService}>
          <TermsOfServicePage />
        </Route>
        <Route exact path={Routes.donate}>
          <DonatePage />
        </Route>
        <Route exact path={Routes.privacyPolicy}>
          <PrivacyPolicyPage />
        </Route>
        <Route /*animation="slideup"*/ exact path={Routes.settings}>
          <SettingsPage />
        </Route>
        <Route exact path={Routes.controlSettings}>
          <ControlSettingsPage />
        </Route>
        <Route exact path={Routes.login}>
          <LoginPage />
        </Route>
        <Route exact path={Routes.play}>
          <PlayPage />
        </Route>
        <Route exact path={Routes.comingSoon}>
          <ComingSoonPage />
        </Route>
        <Route exact path={Routes.profile}>
          <ProfilePage />
        </Route>
        <Route exact path={Routes.earnCoins}>
          <EarnCreditsPage />
        </Route>
        <Route exact path={Routes.affiliateProgram}>
          <AffiliateProgramPage />
        </Route>
        <Route exact path={Routes.scoreboard}>
          <ScoreboardPage />
        </Route>
        <Route exact path={Routes.welcome}>
          <WelcomePage />
        </Route>
        <Route exact path={Routes.challengeRequired}>
          <ChallengeRequiredPage />
        </Route>
        <Route exact path={Routes.allSet}>
          <AllSetPage />
        </Route>
        <Route exact path={Routes.market} key="market">
          <MarketPage />
        </Route>
        <Route exact path={`${Routes.market}/:id`}>
          <MarketCharacterPage />
        </Route>
        <Route exact path={Routes.lobby}>
          <LobbyPage />
        </Route>
        <Route exact path={Routes.rooms}>
          <LobbyPage />
        </Route>
        <Route exact path={Routes.singlePlayerOptions}>
          <SinglePlayerOptionsPage />
        </Route>
        <Route exact path={Routes.singlePlayerGameModePicker}>
          <SinglePlayerGameModePickerPage />
        </Route>
        <Route exact path={Routes.singlePlayerPlay}>
          <SinglePlayerPage />
        </Route>
        <Route exact path={Routes.challenges}>
          <ChallengesPage />
        </Route>
        <Route exact path={Routes.createChallenge}>
          <CreateChallengePage />
        </Route>
        <Route exact path={Routes.loadChallenge}>
          <LoadChallengePage />
        </Route>
        <Route path={`${Routes.challenges}/:id`}>
          <ChallengePage />
        </Route>
        <Route exact path={`${Routes.rooms}/:id`}>
          <RoomPage />
        </Route>
        <Route exact path={`${Routes.rooms}/:id/info`}>
          <RoomInfoPage />
        </Route>
        <Route exact path={Routes.pwa}>
          <PwaPage />
        </Route>
        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
    </>
  );
}
