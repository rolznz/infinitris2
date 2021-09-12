import { createTheme, ThemeOptions } from '@material-ui/core/styles';
import { SkeletonClassKey } from '@material-ui/lab/Skeleton';

declare module '@material-ui/core/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSkeleton: SkeletonClassKey;
  }
}

declare module '@material-ui/core/styles/createPalette' {
  interface TypeBackground {
    loader: string;
  }
}

export const zIndexes = {
  above: 1,
  hamburgerButton: 100,
  drawer: 9950,
  loader: 9999,
};

const coreThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: ['Comfortaa'].join(','),

    h1: {
      fontSize: 36,
      textTransform: 'lowercase',
    },
    body1: {
      textTransform: 'lowercase',
    },
  },
  zIndex: zIndexes as any,
  overrides: {
    MuiDrawer: {
      root: {
        zIndex: zIndexes.drawer,
      },
    },
    MuiSkeleton: {
      rect: {
        borderRadius: 4,
      },
    },
    MuiSwitch: {
      /*thumb: {
        backgroundColor: '#ECECED',
        color: '#ECECED',
      },
      input: {
        backgroundColor: '#ECECED',
        color: '#ECECED',
      },
      checked: {
        backgroundColor: '#ECECED',
        color: '#ECECED',
      },*/
    },
    MuiCheckbox: {
      root: {
        color: '#ECECED',
        border: '2px solid #233035',
        padding: 0,
        margin: 4,
      },
    },
    MuiDivider: {
      root: {
        background: '#ECECED !important',
        height: 2,
      },
    },
    MuiLinearProgress: {
      colorPrimary: {
        backgroundColor: 'transparent',
        border: '1px solid #ECECED',
        boxSizing: 'border-box',
      },
      barColorPrimary: {
        backgroundColor: '#ECECED',
      },
    },
    MuiButton: {
      contained: {
        borderRadius: 32,
        paddingTop: 0,
        paddingBottom: 0,
        textTransform: 'lowercase',
        border: '4px solid #233035',
      },
    },
    MuiFormControlLabel: {
      label: {
        textTransform: 'lowercase',
      },
    },
    MuiSelect: {
      root: {},
      icon: {
        color: '#ECECED',
      },
    },
  },
  palette: {
    primary: {
      main: '#a4daf2', //'#2B57A6',
      contrastText: '#ECECED',
    },
    secondary: {
      main: '#a0a09f',
      contrastText: '#ECECED',
    },
    background: {
      loader: '#0f1d22',
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
      //tertiary: '#12232B'  // loader: 081428
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
