import {
  createTheme,
  responsiveFontSizes,
  ThemeOptions,
} from '@material-ui/core';
import { merge } from 'lodash';

// colors
const primary = '#448aff';
const primaryDark = '#1C2938';
const secondary = '#344252';
const secondaryLight = '#252833';

const black = '#000000';
const white = '#ffffff';

const textPrimary = '#ffffff';
const textSecondary = '#696c80';
const bgColor = '#12131a';
const bgPalette = '#1b1e29';

const successMain = '#0fc679';
const successDark = '#1DB2D5';

const errorMain = '#ff5252';
const errorDark = '#f00';

const divider = 'rgba(130, 177, 255, 0.08)';

// breakpoints
const xl = 1920;
const lg = 1280;
const md = 960;
const sm = 700;
const xs = 0;

// spacing
const spacing = 8;

function createQuickTheme(
  custom: any,
  options?: ThemeOptions | undefined,
  ...args: any[]
) {
  return createTheme(merge(custom, options), ...args);
}

export const mainTheme = responsiveFontSizes(
  createQuickTheme({
    palette: {
      action: {
        disabledBackground: '',
        disabled: 'set color of text here',
      },
      primary: {
        main: primary,
        dark: primaryDark,
      },
      secondary: {
        main: secondary,
        light: secondaryLight,
      },
      common: {
        black,
        white,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      background: {
        default: bgColor,
        paper: bgPalette,
      },
      success: {
        main: successMain,
        dark: successDark,
      },
      error: {
        main: errorMain,
        dark: errorDark,
      },
      divider: divider,
    },
    spacing,
    breakpoints: {
      values: {
        xl,
        lg,
        md,
        sm,
        xs,
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      fontWeightRegular: 500,
    },
    overrides: {
      MuiButton: {
        root: {
          textTransform: 'none',
          backgroundColor: primary,
          color: white,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: primary,
            opacity: 0.8,
          },
          '&$disabled': {
            opacity: 0.3,
          },
        },
        label: {
          fontSize: 16,
          lineHeight: '20px',
        },
      },
      MuiContainer: {
        root: {
          paddingLeft: '40px !important',
          paddingRight: '40px !important',
        },
      },
    },
  }),
);

const theme = { mainTheme };

export default theme;
