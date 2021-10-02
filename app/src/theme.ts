import { createTheme, ThemeOptions } from '@material-ui/core/styles';
import { SkeletonClassKey } from '@material-ui/lab/Skeleton';
declare module '@material-ui/core/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSkeleton: SkeletonClassKey;
  }
}

declare module '@material-ui/core/styles/createPalette' {
  interface PaletteOptions {
    tertiary?: PaletteColorOptions;
  }
  interface Palette {
    tertiary: PaletteColor;
  }
  interface TypeBackground {
    loader: string;
    paperDark: string;
  }
}

export const borderColor = 'rgba(249, 248, 247, 0.3)';

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
    h2: {
      fontSize: 32,
      textTransform: 'lowercase',
    },
    h3: {
      fontSize: 28,
      textTransform: 'lowercase',
    },
    h4: {
      fontSize: 24,
      textTransform: 'lowercase',
    },
    h5: {
      fontSize: 20,
      textTransform: 'lowercase',
    },
    h6: {
      fontSize: 18,
      textTransform: 'lowercase',
    },
    body1: {
      textTransform: 'lowercase',
      fontSize: 16,
    },
  },
  zIndex: zIndexes as any,
  overrides: {
    MuiSvgIcon: {
      colorPrimary: {
        color: '#ECECED',
      },
    },
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
        border: `4px solid ${borderColor}`,
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
    MuiIconButton: {
      label: {
        //margin: '-2px',
        //transform: 'translateX(0.5px)',
      },
    },
    MuiButton: {
      contained: {
        borderRadius: 32,
        paddingTop: 0,
        paddingBottom: 0,
        textTransform: 'lowercase',
        border: `4px solid ${borderColor}`,
        boxShadow: 'none',
        backgroundClip: 'padding-box',
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
      main: '#2F67D7',
      contrastText: '#ECECED',
    },
    secondary: {
      main: '#A0BDD9',
      contrastText: '#ECECED',
    },
    tertiary: {
      main: '#A4DAF2',
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
      paper: '#1E448F',
      paperDark: '#113b77',
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
      paper: '#081B29',
      paperDark: '#081B29',
    },
    text: {
      primary: '#999999',
      //secondary: '#ECECED',
      //tertiary: '#12232B'  // loader: 081428
    },
    primary: {
      main: '#103950',
      contrastText: '#ECECED',
    },
    secondary: {
      main: '#889796',
      contrastText: '#ECECED',
    },
    tertiary: {
      main: '#A4DAF2',
      contrastText: '#ECECED',
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
