import useOrientation from 'react-use/lib/useOrientation';
import useWindowSize from 'react-use/lib/useWindowSize';

export function useIsLandscape() {
  const windowSize = useWindowSize();
  useOrientation(); // TODO: review (iOS)
  return windowSize.width >= windowSize.height;
}
