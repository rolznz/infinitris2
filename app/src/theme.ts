import { createTheme, ThemeOptions } from '@material-ui/core/styles';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';
import { SkeletonClassKey } from '@material-ui/lab/Skeleton';

declare module '@material-ui/core/styles/overrides' {
  export interface ComponentNameToClassKey {
    MuiSkeleton: SkeletonClassKey;
  }
}

const coreThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: ['Nunito'].join(','),
  },
  zIndex: {
    hamburgerButton: 1,
    loader: 9999,
  } as any,
  overrides: {
    MuiSkeleton: {
      rect: {
        borderRadius: 4,
      },
    },
  },
};

const lightThemeOptions: ThemeOptions = {
  ...coreThemeOptions,
  palette: {
    ...(coreThemeOptions.palette || {}),
    background: {
      ...(coreThemeOptions.palette?.background || {}),
      paper: '#1c6cae',
    },
    primary: {
      //light: '#ECECED',

      main: '#2B57A6',
      contrastText: '#ECECED',
    },
    secondary: {
      main: '#a0a09f', //'#0E0C66',
      contrastText: '#ECECED',
    },
    text: {
      primary: '#ECECED',
      //secondary: '#2B57A6',
    },
  } as Partial<PaletteOptions>,
};

const darkThemeOptions: ThemeOptions = {
  ...coreThemeOptions,
  palette: {
    ...(coreThemeOptions.palette || {}),
    type: 'dark',
    background: {
      ...(coreThemeOptions.palette?.background || {}),
      paper: '#0f1d22',
    },
    secondary: {
      //light: '#ECECED',
      main: '#999999',
      contrastText: '#ECECED',
    },
    primary: {
      main: '#2B57A6', //'#a0a09f', //main: '#12232B',
      contrastText: '#ECECED',
    },
    text: {
      primary: '#ECECED',
      //secondary: '#2B57A6',
    },
    /*text: {
      primary: '#ECECED',
      secondary: '#999999',
      tertiary: '#12232B',
    }*/
  },
};

const lightTheme = createTheme(lightThemeOptions);
const darkTheme = createTheme(darkThemeOptions);

export { lightTheme, darkTheme };
