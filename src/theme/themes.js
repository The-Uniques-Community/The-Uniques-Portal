import { createTheme } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};


export const lightTheme = createTheme({
  palette: lightPalette,
  breakpoints,
  typography,
});

export const darkTheme = createTheme({
  palette: darkPalette,
  breakpoints,
  typography,
});
