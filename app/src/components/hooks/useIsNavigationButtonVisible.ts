import { useLocation } from 'react-router-dom';
//import { isPwa } from '@/utils/isMobile';
//import { useIsFullscreen } from '@/components/hooks/useIsFullscreen';
import useSinglePlayerOptionsStore from '@/state/SinglePlayerOptionsStore';
import Routes from '@/models/Routes';
import { useUser } from '@/components/hooks/useUser';
import { isIngameRoute } from '@/PageRouter';

export function useIsNavigationButtonVisible() {
  //const isFullscreen = useIsFullscreen();
  const user = useUser();
  const location = useLocation();
  const singlePlayerOptionsFormData = useSinglePlayerOptionsStore(
    (store) => store.formData
  );
  const isDemo =
    location.pathname.indexOf(Routes.singlePlayerPlay) >= 0 &&
    singlePlayerOptionsFormData.isDemo;
  const hideUI = user.showUI === false && isIngameRoute(location.pathname);
  if (location.pathname === '/' || isDemo || hideUI) {
    //|| (!isPwa() && !isFullscreen) || isDemo) {
    return false;
  }
  return true;
}
