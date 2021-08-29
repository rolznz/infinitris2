import { useUser } from '../../state/UserStore';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export default function useDarkMode() {
  const isSystemDarkModeEnabled = useMediaQuery('(prefers-color-scheme: dark)');
  const userAppTheme = useUser().appTheme;
  const isDarkMode =
    userAppTheme === 'dark' ||
    ((!userAppTheme || userAppTheme === 'default') && isSystemDarkModeEnabled);
  return isDarkMode;
}
