import React from 'react';
import { Route, Switch, BrowserRouter, useLocation } from 'react-router-dom';
import AllSetPage from './components/pages/AllSetPage';
import { CreateChallengePage } from './components/pages/CreateChallengePage/CreateChallengePage';
import { LoadChallengePage } from './components/pages/CreateChallengePage/LoadChallengePage';
import LobbyPage from './components/pages/LobbyPage';
import LoginPage from './components/pages/LoginPage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import ProfilePage from './components/pages/ProfilePage';
import RoomPage from './components/pages/RoomPage';
import ControlSettingsPage from './components/pages/SettingsPage/ControlSettingsPage';
import SettingsPage from './components/pages/SettingsPage/SettingsPage';
import SinglePlayerPage from './components/pages/SinglePlayerPage';
import ChallengePage from './components/pages/ChallengePage/ChallengePage';
import ChallengeRequiredPage from './components/pages/ChallengeRequiredPage';
import { ChallengesPage } from './components/pages/ChallengesPage/ChallengesPage';
import WelcomePage from './components/pages/WelcomePage';
import Routes from './models/Routes';
import { CreditsPage } from './components/pages/CreditsPage/CreditsPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import EarnCreditsPage from './components/pages/EarnCreditsPage';
import ScoreboardPage from './components/pages/ScoreboardPage/ScoreboardPage';
import AffiliateProgramPage from './components/pages/AffiliateProgramPage';
import { ComingSoonPage } from './components/pages/ComingSoonPage';
import CustomizeProfilePage from './components/pages/CustomizeProfilePage';
import { HomePageBackground } from './components/pages/HomePage/HomePageBackground';
import HamburgerMenuButton from './components/ui/HamburgerMenu/HamburgerMenuButton';
import { TermsOfServicePage } from './components/pages/TermsOfServicePage';
import { AnimatePresence, motion, TargetAndTransition } from 'framer-motion';
import FlexBox from './components/ui/FlexBox';
import { zIndexes } from './theme';
import { DialogManager } from './components/ui/modals/DialogManager';
import AboutPage from './components/pages/AboutPage/AboutPage';
import DonatePage from './components/pages/AboutPage/DonatePage';
import MarketPage from './components/pages/MarketPage/MarketPage';

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
          !location.pathname.startsWith(Routes.singlePlayer) &&
          !location.pathname.startsWith(Routes.rooms) ? (
          <>{props.children}</>
        ) : null;
      }}
    />
  );
}

type PageAnimationType = 'slideup';

function SlideUpPageAnimation(props: React.PropsWithChildren<{}>) {
  return (
    <motion.div
      animate={{ y: '0vw' }}
      exit={{ y: '100vh' }}
      initial={{ y: '100vh' }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        zIndex: zIndexes.above,
      }}
    >
      {props.children}
    </motion.div>
  );
}
function DefaultPageAnimation(props: React.PropsWithChildren<{}>) {
  return (
    <motion.div
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
      }}
    >
      {props.children}
    </motion.div>
  );
}

type AnimatedRouteProps = React.PropsWithChildren<{
  exact?: boolean;
  path?: string;
  animation?: PageAnimationType;
}>;

const AnimatedRoute = React.memo((props: AnimatedRouteProps) => {
  const { animation, ...routerProps } = props;
  return (
    <Route {...routerProps}>
      {animation === 'slideup' ? (
        <SlideUpPageAnimation>{props.children}</SlideUpPageAnimation>
      ) : (
        <DefaultPageAnimation>{props.children}</DefaultPageAnimation>
      )}
    </Route>
  );
});

export default function PageRouter() {
  return (
    <BrowserRouter>
      <RouterContents />
    </BrowserRouter>
  );
}

function RouterContents() {
  const location = useLocation();
  return (
    <>
      <DialogManager />
      <OutsideGameElement>
        <HamburgerMenuButton />
        {/*<Header />*/}
      </OutsideGameElement>
      <AnimatePresence initial={false}>
        <Switch location={location} key={location.pathname}>
          <AnimatedRoute exact path={Routes.home}>
            <HomePageBackground />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.credits}>
            <CreditsPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.about}>
            <AboutPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.termsOfService}>
            <TermsOfServicePage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.donate}>
            <DonatePage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.privacyPolicy}>
            <PrivacyPolicyPage />
          </AnimatedRoute>
          <AnimatedRoute /*animation="slideup"*/ exact path={Routes.settings}>
            <SettingsPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.controlSettings}>
            <ControlSettingsPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.login}>
            <LoginPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.comingSoon}>
            <ComingSoonPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.profile}>
            <ProfilePage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.customizeProfile}>
            <CustomizeProfilePage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.earnCoins}>
            <EarnCreditsPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.affiliateProgram}>
            <AffiliateProgramPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.scoreboard}>
            <ScoreboardPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.welcome}>
            <WelcomePage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.challengeRequired}>
            <ChallengeRequiredPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.allSet}>
            <AllSetPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.market}>
            <MarketPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.lobby}>
            <LobbyPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.singlePlayer}>
            <SinglePlayerPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.challenges}>
            <ChallengesPage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.createChallenge}>
            <CreateChallengePage />
          </AnimatedRoute>
          <AnimatedRoute exact path={Routes.loadChallenge}>
            <LoadChallengePage />
          </AnimatedRoute>
          <AnimatedRoute path={`${Routes.challenges}/:id`}>
            <ChallengePage />
          </AnimatedRoute>
          <AnimatedRoute exact path={`${Routes.rooms}/:id`}>
            <RoomPage />
          </AnimatedRoute>
          <AnimatedRoute>
            <NotFoundPage />
          </AnimatedRoute>
        </Switch>
      </AnimatePresence>
    </>
  );
}
