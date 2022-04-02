import useWindowSize from 'react-use/lib/useWindowSize';

export function useIsFullscreen() {
  useWindowSize();
  const isFullscreen = window.innerHeight === window.screen.height;

  return isFullscreen;
}
