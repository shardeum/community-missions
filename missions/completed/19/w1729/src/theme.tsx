import { extendTheme } from "@chakra-ui/react";
import { createBreakpoints } from "@chakra-ui/theme-tools";
import { StepsStyleConfig as Steps } from 'chakra-ui-steps';

const fonts = { mono: `'Menlo', monospace` };

const breakpoints = createBreakpoints({
  sm: "40em",
  md: "52em",
  lg: "64em",
  xl: "80em",
});

const theme = extendTheme({
  semanticTokens: {
    colors: {
      text: {
        default: "#16161D",
        _dark: "#ade3b8",
      },
    },
  },
  colors: {
    black: "#16161D",
  },
  fonts,
  breakpoints,
  components: {
    Steps,
  },
});

export default theme;
