import { createTheme, ThemeOptions } from '@mui/material/styles';
import lodashMerge from 'lodash.merge';
import { colors, coreThemeOptions } from './theme';

const darkThemeOptions: ThemeOptions = lodashMerge({}, coreThemeOptions, {
  palette: {
    mode: 'dark',
    background: {
      paper: '#081B29',
      paperDark: '#081B29',
    },
    text: {
      primary: '#9A9A9A',
      secondary: '#444444',
    },
    primary: {
      main: '#103950',
      contrastText: colors.white,
    },
    secondary: {
      main: '#889796',
      contrastText: colors.white,
    },
    tertiary: {
      main: '#A4DAF2',
      contrastText: colors.white,
    },
  },
  typography: {
    ...(coreThemeOptions.typography || {}),
    allVariants: {
      color: '#999999',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background:
            'linear-gradient(180deg, #137781 0%, #145F66 26.56%, #0D5058 57.81%, #114650 85.94%)',
        },
      },
    },
  },
} as ThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
