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
export const borderColorLight = 'rgba(249, 248, 247, 0.1)';
export const white = '#ECECED';
export const grey = '#A0997D';
export const gold = '#D37953';

export const boxShadows = {
  small: '0px 4px 4px rgba(0, 0, 0, 0.3)',
};

export const zIndexes = {
  above: 1,
  hamburgerButton: 100,
  drawer: 950,
  loader: 1000,
};

export const borderRadiuses = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 20,
  xl: 32,
  full: 1000,
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
    MuiPaper: {
      root: {
        boxShadow: 'none !important',
      },
    },
    MuiAccordion: {
      root: {
        width: '100%',
      },
    },
    MuiAccordionSummary: {
      root: {
        backgroundColor: borderColor,
        boxShadow: boxShadows.small,
        marginLeft: 20,
        marginRight: 20,
        borderRadius: borderRadiuses.full,
        marginTop: 4,
        marginBottom: 4,
        border: 'none',
        //maxWidth: 200,
        '&::before': {
          background: 'yellow',
        },
      },
      content: {
        alignItems: 'center',
      },
    },
    MuiSvgIcon: {
      colorPrimary: {
        color: white,
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
    MuiCard: {
      root: {
        boxShadow: 'none',
        borderRadius: '0',
      },
    },
    MuiCheckbox: {
      root: {
        color: white,
        border: `4px solid ${borderColor}`,
        padding: 0,
        margin: 4,
      },
    },
    MuiLink: {
      root: {
        color: white,
      },
    },
    MuiDivider: {
      root: {
        background: `${white} !important`,
        height: 2,
      },
    },
    MuiLinearProgress: {
      colorPrimary: {
        backgroundColor: 'transparent',
        border: `1px solid ${white}`,
        boxSizing: 'border-box',
      },
      barColorPrimary: {
        backgroundColor: white,
      },
    },
    MuiIconButton: {
      label: {
        //margin: '-2px',
        //transform: 'translateX(0.5px)',
        color: white,
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
        color: white,
      },
    },
  },
  palette: {
    primary: {
      main: '#2F67D7',
      contrastText: white,
    },
    secondary: {
      main: '#789AB8',
      contrastText: white,
    },
    tertiary: {
      main: '#A4DAF2',
      contrastText: white,
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
      primary: white,
      secondary: '#002369',
    },
  },
  typography: {
    ...(coreThemeOptions.typography || {}),
    allVariants: {
      color: white,
    },
  },
  overrides: {
    // TODO: lodash merge
    ...coreThemeOptions.overrides,
    MuiCard: {
      ...coreThemeOptions.overrides?.MuiCard,
      root: {
        ...coreThemeOptions.overrides?.MuiCard?.root,
        background:
          'linear-gradient(180deg, #3A9AD1 0%, #1F72B7 48.44%, #0B61B1 85.94%);',
      },
    },
    MuiLink: {
      ...coreThemeOptions.overrides?.MuiLink,
      root: {
        ...coreThemeOptions.overrides?.MuiLink?.root,
        color: '#ccccff',
      },
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
      primary: '#9A9A9A',
      secondary: '#444444',
    },
    primary: {
      main: '#103950',
      contrastText: white,
    },
    secondary: {
      main: '#889796',
      contrastText: white,
    },
    tertiary: {
      main: '#A4DAF2',
      contrastText: white,
    },
  },
  typography: {
    ...(coreThemeOptions.typography || {}),
    allVariants: {
      color: '#999999',
    },
  },
  overrides: {
    ...coreThemeOptions.overrides,
    MuiCard: {
      ...coreThemeOptions.overrides?.MuiCard,
      root: {
        ...coreThemeOptions.overrides?.MuiCard?.root,
        background:
          'linear-gradient(180deg, #137781 0%, #145F66 26.56%, #0D5058 57.81%, #114650 85.94%)',
      },
    },
  },
};

const lightTheme = createTheme(lightThemeOptions);
const darkTheme = createTheme(darkThemeOptions);

export { lightTheme, darkTheme };
