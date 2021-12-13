import useWindowSize from 'react-use/lib/useWindowSize';

export function useIsLandscape() {
  const windowSize = useWindowSize();
  return windowSize.width >= windowSize.height;
}
