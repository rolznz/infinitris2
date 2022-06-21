import { useLocation } from 'react-router-dom';
//import { isPwa } from '@/utils/isMobile';
//import { useIsFullscreen } from '@/components/hooks/useIsFullscreen';
import useSinglePlayerOptionsStore from '@/state/SinglePlayerOptionsStore';
import Routes from '@/models/Routes';

export function useIsBackButtonVisible() {
  //const isFullscreen = useIsFullscreen();
  const location = useLocation();
  const singlePlayerOptionsFormData = useSinglePlayerOptionsStore(
    (store) => store.formData
  );
  const isDemo =
    location.pathname.indexOf(Routes.singlePlayerPlay) >= 0 &&
    singlePlayerOptionsFormData.isDemo;
  if (location.pathname === '/' || isDemo) {
    //|| (!isPwa() && !isFullscreen) || isDemo) {
    return false;
  }
  return true;
}
