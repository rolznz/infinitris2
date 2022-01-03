import { ThemeOptions } from '@mui/material/styles';
import { SkeletonClassKey } from '@mui/material/Skeleton';
import '@mui/lab/themeAugmentation';
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSkeleton: SkeletonClassKey;
  }
}

declare module '@mui/material/styles/createPalette' {
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

// TODO: move these into objects
export const borderColorDark = 'rgba(249, 248, 247, 0.5)';
export const borderColor = 'rgba(249, 248, 247, 0.3)';
export const borderColorLight = 'rgba(249, 248, 247, 0.1)';
export const grey = '#A0997D';
export const gold = '#D37953';

export const colors = {
  white: '#ECECED',
};

export const boxShadows = {
  small: '0px 4px 4px rgba(0, 0, 0, 0.3)',
};

export const zIndexes = {
  below: -1,
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

export const coreThemeOptions: ThemeOptions = {
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
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none !important',
        },
      },
    },
    MuiTab: {
      defaultProps: {
        sx: {
          color: borderColor,
        },
      },
    },
    MuiTabPanel: {
      styleOverrides: {
        root: {
          display: 'flex',
          width: '100%',
          padding: 0,
          alignSelf: 'flex-start',
        },
      },
    },
    MuiMobileStepper: {
      styleOverrides: {
        root: {
          background: 'none',
          justifyContent: 'center !important',
        },
        dot: {
          width: 12,
          height: 12,
          marginLeft: 4,
          marginRight: 4,
          border: `1px solid #555555`,
          backgroundColor: '#88888866',
        },
        dotActive: {
          backgroundColor: '#FFFFFFAA',
          boxShadow: boxShadows.small,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: borderColorLight,
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
    },
    MuiSvgIcon: {
      styleOverrides: {
        colorPrimary: {
          color: colors.white,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        root: {
          zIndex: zIndexes.drawer,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        rectangular: {
          borderRadius: 4,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: '0',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.white,
          border: `4px solid ${borderColor}`,
          padding: 0,
          margin: 4,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colors.white,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          background: `${colors.white} !important`,
          height: 2,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: 'transparent',
          border: `1px solid ${colors.white}`,
          boxSizing: 'border-box',
        },
        barColorPrimary: {
          backgroundColor: colors.white,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        // label: {
        //   //margin: '-2px',
        //   //transform: 'translateX(0.5px)',
        //   color: colors.white,
        // },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 32,
          paddingTop: 0,
          paddingBottom: 0,
          textTransform: 'lowercase',
          border: `4px solid ${borderColor}`,
          boxShadow: 'none',
          backgroundClip: 'padding-box',
        },
        sizeLarge: {
          fontSize: '20px',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          textTransform: 'lowercase',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        //root: {},
        icon: {
          color: colors.white,
        },
        outlined: {
          paddingTop: '5px',
          paddingBottom: '5px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: borderRadiuses.base,
          paddingTop: '2px',
          paddingBottom: '2px',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#2F67D7',
      contrastText: colors.white,
    },
    secondary: {
      main: '#789AB8',
      contrastText: colors.white,
    },
    tertiary: {
      main: '#A4DAF2',
      contrastText: colors.white,
    },
    background: {
      loader: '#0f1d22',
    },
  },
};
