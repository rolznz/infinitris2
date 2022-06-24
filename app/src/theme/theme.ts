import { ThemeOptions } from '@mui/material/styles';
import { SkeletonClassKey } from '@mui/material/Skeleton';
import '@mui/lab/themeAugmentation';
import { fontFamily, secondaryFontFamily } from 'infinitris2-models';
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

export const lockFilter = 'brightness(1.125) grayscale(100%)';

export const colors = {
  white: '#ECECED',
  black: '#000000',
  green: '#44ff44',
  blue: '#4444ff',
  lightBlue: '#52C1FF',
};

export const boxShadows = {
  small: '0px 4px 4px rgba(0, 0, 0, 0.3)',
};
export const dropShadows = {
  small: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.4))',
  selected:
    'drop-shadow(0px 0px 3px rgba(255, 255, 255, 1)) drop-shadow(0px 0px 2px rgba(255, 255, 255, 1))',
};

export const textShadows = {
  small: `0px 1px ${colors.black}`,
  base: `0px 1px 3px ${colors.black}`,
};

export const spacing = {
  small: 1,
};

export const zIndexes = {
  below: -1,
  above: 1,
  hamburgerButton: 100,
  drawer: 950,
  loader: 1000,
};

export const borderRadiuses = {
  xs: '4px',
  sm: '8px',
  base: '16px',
  lg: '20px',
  xl: '32px',
  full: '1000px',
};

export const coreThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: [fontFamily].join(','),

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
      fontSize: 16,
      fontFamily: [fontFamily].join(','),
    },
    body2: {
      fontSize: 16,
      fontFamily: [secondaryFontFamily].join(','),
    },
    caption: {
      fontFamily: [secondaryFontFamily].join(','),
    },
  },
  zIndex: zIndexes as any,
  components: {
    MuiInput: {
      styleOverrides: {
        input: {
          //padding: '10px',
          //marginBottom: '2px',
          //borderRadius: borderRadiuses.base,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: borderColor,
          overflow: 'visible',
        },
      },
    },
    MuiTextField: {},
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
          /*'&.Mui-focusVisible': {
            color: '#ffffffaa',
          },*/
          '.MuiTouchRipple-root': {
            width: '100%',
            height: '100%',
            //borderRadius: 32,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            transform: 'translate(2px, 2px)',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colors.white,
          ':hover': {
            cursor: 'pointer',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          background: `${borderColor} !important`,
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
        root: {
          borderRadius: borderRadiuses.base,
          boxShadow: boxShadows.small,
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
        root: {
          '.MuiTouchRipple-root': {
            width: '100%',
            height: '100%',
            borderRadius: 32,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          '.MuiTouchRipple-child': {
            width: 'calc(100% + 16px) !important',
            position: 'absolute',
            left: '-8px !important',
            right: '-8px !important',
          },
        },
        contained: {
          borderRadius: 32,
          paddingTop: 0,
          paddingBottom: 0,
          textTransform: 'lowercase',
          border: `4px solid ${borderColor}`,
          boxShadow: 'none',
          backgroundClip: 'padding-box',
        },
        outlined: {
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
    MuiMenu: {
      styleOverrides: {
        list: {
          paddingBottom: 0,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: `1px solid ${borderColor}`,
          borderRadius: borderRadiuses.base,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: colors.white,
        },
        outlined: {
          paddingTop: '5px',
          paddingBottom: '5px',

          /*root: {
          border: `1px solid ${borderColor}`,
          borderRadius: borderRadiuses.base,
          paddingBottom: 0,
        },*/
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
