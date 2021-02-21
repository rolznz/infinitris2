enum Routes {
  welcome = '/welcome',
  rooms = '/rooms',
  lobby = '/lobby',
  home = '/',
  profile = '/profile',
  login = '/login',
  singlePlayer = '/single-player',
  settings = '/settings',
  controlSettings = '/settings/controls',
  tutorials = '/tutorials',
  createChallenge = '/create/challenge',
  loadChallenge = '/create/challenge/load',
  tutorialRequired = '/tutorial-required', // TODO: should be a level map?
  allSet = '/all-set', // TODO: rename to "ready to play"
}

export default Routes;
