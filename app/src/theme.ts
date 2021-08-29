import { createTheme, ThemeOptions } from '@material-ui/core/styles';
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
    MuiCheckbox: {
      root: {
        color: '#ECECED',
      },
    },
    MuiDivider: {
      root: {
        background: '#ECECED !important',
        height: 2,
      },
    },
  },
  palette: {
    primary: {
      main: '#2B57A6',
      contrastText: '#ECECED',
    },
    secondary: {
      main: '#a0a09f',
      contrastText: '#ECECED',
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
    text: {
      primary: '#ECECED',
      secondary: '#2B57A6',
      //tertiary: '#0E0C66',
    },
  },
  typography: {
    ...(coreThemeOptions.typography || {}),
    allVariants: {
      color: '#ECECED',
    },
  },
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
    text: {
      primary: '#999999',
      //secondary: '#ECECED',
      //tertiary: '#12232B'
    },
  },
  typography: {
    ...(coreThemeOptions.typography || {}),
    allVariants: {
      color: '#999999',
    },
  },
};

const lightTheme = createTheme(lightThemeOptions);
const darkTheme = createTheme(darkThemeOptions);

export { lightTheme, darkTheme };
