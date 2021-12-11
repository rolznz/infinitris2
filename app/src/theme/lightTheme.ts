import { createTheme, ThemeOptions } from '@mui/material/styles';
import lodashMerge from 'lodash.merge';
import { colors, coreThemeOptions } from './theme';

const lightThemeOptions: ThemeOptions = lodashMerge({}, coreThemeOptions, {
  palette: {
    background: {
      paper: '#1E448F',
      paperDark: '#113b77',
    },
    text: {
      primary: colors.white,
      secondary: '#002369',
    },
  },
  typography: {
    allVariants: {
      color: colors.white,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background:
            'linear-gradient(180deg, #3A9AD1 0%, #1F72B7 48.44%, #0B61B1 85.94%);',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#ccccff',
        },
      },
    },
  },
} as ThemeOptions);

export const lightTheme = createTheme(lightThemeOptions);
