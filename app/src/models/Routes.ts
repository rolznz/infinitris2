enum Routes {
  welcome = '/welcome',
  rooms = '/rooms',
  lobby = '/lobby',
  home = '/',
  credits = '/credits',
  termsOfService = '/tos',
  donate = '/donate',
  privacyPolicy = '/privacy',
  profile = '/profile',
  login = '/login',
  comingSoon = '/coming-soon',
  singlePlayerPlay = '/single-player/play',
  singlePlayerGameModePicker = '/single-player/picker',
  singlePlayerOptions = '/single-player/options',
  settings = '/settings',
  controlSettings = '/settings/controls',
  challenges = '/challenges',
  createChallenge = '/challenge-maker',
  newChallenge = '/new-challenge',
  challengeRequired = '/challenge-required',
  scoreboard = '/scoreboard',
  allSet = '/all-set',
  market = '/market',
  earnCoins = '/earn-coins',
  affiliateProgram = '/affiliate-program',
  about = '/about',
  play = '/play',
  pwa = '/pwa',
  storyMode = '/story-mode',
  premium = '/premium',
  trailerFeature = '/trailer-feature',
}

export default Routes;

export enum RouteSubPaths {
  challengesPageAttempts = 'attempts',
}
