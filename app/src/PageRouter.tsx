import React from 'react';
import { Route, Switch, BrowserRouter, useLocation } from 'react-router-dom';
// import AllSetPage from '@/components/pages/AllSetPage';
import { CreateChallengePage } from '@/components/pages/CreateChallengePage/CreateChallengePage';
import { LoadChallengePage } from '@/components/pages/CreateChallengePage/NewChallengePage';
import LobbyPage from '@/components/pages/LobbyPage/LobbyPage';
import LoginPage from '@/components/pages/LoginPage';
import { NotFoundPage } from '@/components/pages/NotFoundPage/NotFoundPage';
import ProfilePage from '@/components/pages/ProfilePage/ProfilePage';
import RoomPage from '@/components/pages/RoomPage';
import ControlSettingsPage from '@/components/pages/SettingsPage/ControlSettingsPage';
import SettingsPage from '@/components/pages/SettingsPage/SettingsPage';
import ChallengePage from '@/components/pages/ChallengePage/ChallengePage';
import { ChallengesPage } from '@/components/pages/ChallengesPage/ChallengesPage';
import { ChallengeAttemptsPage } from '@/components/pages/ChallengePage/ChallengeAttemptsPage';
// import WelcomePage from '@/components/pages/WelcomePage';
import Routes, { RouteSubPaths } from './models/Routes';
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
import HomeButton from '@/components/ui/HomeButton';
import useAffiliateLinkRef from '@/components/hooks/useAffiliateLinkRef';
import { PwaPage } from '@/components/pages/PwaPage/PwaPage';
import { HomePage } from '@/components/pages/HomePage/HomePage';
import { SinglePlayerOptionsPage } from '@/components/pages/SinglePlayerPage/SinglePlayerOptionsPage';
import SinglePlayerPage from '@/components/pages/SinglePlayerPage/SinglePlayerPage';
import { SinglePlayerGameModePickerPage } from '@/components/pages/SinglePlayerPage/SinglePlayerGameModePickerPage';
import { RoomInfoPage } from '@/components/pages/RoomInfoPage';
import CoinsDisplay from '@/components/ui/CoinsDisplay';
import { StoryModePage } from '@/components/pages/StoryModePage/StoryModePage';
import { TopLeftPanel, TopLeftPanelPortal } from '@/components/ui/TopLeftPanel';
import NavigationButton from '@/components/ui/BackButton';
import useRouterStore from '@/state/RouterStore';
import { PremiumPage } from '@/components/pages/PremiumPage/PremiumPage';

const coinsDisplayPaths = [Routes.market, Routes.profile];

export function isIngameRoute(pathname: string) {
  return (
    (pathname.startsWith(Routes.challenges) &&
      pathname.length > Routes.challenges.length + 1) || // match /challenges or /challenges/ but not /challenges/<challengeId>
    pathname.startsWith(Routes.singlePlayerPlay) ||
    (pathname.startsWith(Routes.rooms) && !pathname.endsWith('/info'))
  );
}

function OutsideGameElement(props: React.PropsWithChildren<{}>) {
  return (
    <Route
      render={({ location }) => {
        return !isIngameRoute(location.pathname) ? <>{props.children}</> : null;
      }}
    />
  );
}

export default function PageRouter() {
  return (
    <BrowserRouter>
      <RouterContents />
    </BrowserRouter>
  );
}

let lastPopStateTime = 0;
let hasNavigated = false;
window.onpopstate = () => {
  lastPopStateTime = Date.now();
  useRouterStore.getState().push(-1);
};

function RouterContents() {
  useAffiliateLinkRef(); // depends on location
  const location = useLocation();
  // only scroll to 0,0 on new page, not on back
  React.useEffect(() => {
    if (Date.now() - lastPopStateTime > 1000) {
      window.scrollTo(0, 0);
      if (hasNavigated) {
        useRouterStore.getState().push();
      }
      hasNavigated = true;
    }
  }, [location]);
  return (
    <>
      <TopLeftPanel>
        <HomeButton />
        <NavigationButton />
      </TopLeftPanel>
      <DialogManager />
      <OutsideGameElement>
        <HamburgerMenuButton />
      </OutsideGameElement>
      <Switch location={location}>
        <Route path={coinsDisplayPaths}>
          <TopLeftPanelPortal>
            <CoinsDisplay />
          </TopLeftPanelPortal>
        </Route>
      </Switch>
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
        <Route exact path={Routes.storyMode}>
          <StoryModePage />
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
        <Route exact path={Routes.premium}>
          <PremiumPage />
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
        <Route exact path={Routes.newChallenge}>
          <LoadChallengePage />
        </Route>
        <Route
          path={`${Routes.challenges}/:id/${RouteSubPaths.challengesPageAttempts}`}
        >
          <ChallengeAttemptsPage />
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
