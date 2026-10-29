/**
 * @file themes.js
 * @description Material UI theme creation module assembling light and dark themes using custom palettes, typography rules, and responsive breakpoints.
 * @architecture Consumed by `src/theme/ThemeProvider.jsx` to dynamically switch the active MUI theme across the component tree.
 * @agent_note Breakpoint thresholds use a custom `md: 960` (standard Material design) and `lg: 1280`. Adjusting these impacts `useMediaQuery` checks in layouts.
 */

import { createTheme } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';

/**
 * @desc Responsive breakpoint thresholds for viewport-dependent layout calculations.
 * @type {Object}
 */
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

/**
 * @desc Light mode Material UI theme instance.
 * @type {import('@mui/material/styles').Theme}
 */
export const lightTheme = createTheme({
  palette: lightPalette,
  breakpoints,
  typography,
});

/**
 * @desc Dark mode Material UI theme instance.
 * @type {import('@mui/material/styles').Theme}
 */
export const darkTheme = createTheme({
  palette: darkPalette,
  breakpoints,
  typography,
});

