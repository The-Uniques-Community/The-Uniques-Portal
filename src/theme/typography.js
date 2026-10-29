/**
 * @file typography.js
 * @description Typography definitions for the application's Material UI theme, specifying primary font families, heading scales, and button casing overrides.
 * @architecture Exported to `src/theme/themes.js` to populate MUI theme typography settings.
 * @agent_note Primary font family is configured as "Absans", falling back to "Roboto", "Arial", and generic sans-serif. Buttons have `textTransform: 'none'` to preserve natural casing.
 */

/**
 * @desc Typography settings object with font family stack and variant font sizes.
 * @type {Object}
 */
export const typography = {
	fontFamily: '"Absans", "Roboto", "Arial", sans-serif',
	h1: {
	  fontSize: '2.5rem',
	  fontWeight: 700,
	},
	h2: {
	  fontSize: '2rem',
	  fontWeight: 600,
	},
	body1: {
	  fontSize: '1rem',
	  lineHeight: 1.5,
	},
	button: {
	  textTransform: 'none', // Disable uppercase for buttons
	},
  };
  