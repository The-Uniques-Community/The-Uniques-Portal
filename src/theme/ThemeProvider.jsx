/**
 * @file ThemeProvider.jsx
 * @description Application theme context provider managing dark/light mode state, synchronizing HTML class attributes, and configuring MUI ThemeProvider.
 * @architecture Encloses the root application tree in `main.jsx`. Supplies `ThemeContext` consumed by layout headers and components, and feeds MUI `lightTheme`/`darkTheme`.
 * @agent_note Toggles the `dark` class on `document.documentElement` to keep Tailwind CSS dark mode in sync with MUI palette modes.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './themes';

/**
 * @desc Context instance providing dark mode state and theme toggling handler.
 */
const ThemeContext = createContext();

/**
 * @component ThemeProvider
 * @description Wraps the component hierarchy with ThemeContext, MUIThemeProvider, and CssBaseline.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child component tree.
 * @state {boolean} isDarkMode - Tracks whether dark mode is currently active.
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MUIThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline /> {/* Resets default browser styles */}
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * @hook useThemeContext
 * @description Hook to consume dark mode status and theme toggle function.
 * @returns {{ isDarkMode: boolean, toggleTheme: Function }} Context value or fallback object.
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  return context || { isDarkMode: false, toggleTheme: () => {} };
};
