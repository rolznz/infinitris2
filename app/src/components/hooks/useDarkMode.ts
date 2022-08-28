import { useUser } from './useUser';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function useDarkMode() {
  const isSystemDarkModeEnabled = useMediaQuery('(prefers-color-scheme: dark)');
  const userAppTheme = useUser().appTheme;
  // console.log('useIsDarkMode', userAppTheme);
  if (userAppTheme && userAppTheme !== 'default') {
    return userAppTheme === 'dark';
  }
  return isSystemDarkModeEnabled;
}
