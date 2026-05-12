export const lightPalette = {
  mode: "light",
  primary: {
    main: "#ca0019", // Red for headings
    light: "#fefefe", // Lighter white for hover highlights
    dark: "#0d0d0d", // Royal shiny black for sidebar and components
  },
  background: {
    default: "#ffffff", // White body background
    paper: "#f4f4f4", // Off-white for cards
    appBar: "#ffffff", // Match body for app bars
    drawer: "#0d0d0d", // Royal shiny black for the sidebar
  },
  text: {
    primary: "#000000", // Black for simple text
    secondary: "#555555", // Slightly lighter black for subtext
    subtext: "#888888", // Gray for hints or less emphasis
    disabled: "#aaaaaa", // Disabled text
    link: "#ca0019", // Red for links
  },
  divider: "#e0e0e0", // Divider lines
  action: {
    hover: "#f4f4f4", // Off-white background with black text on hover
    selected: "#f5f5f5", // Selected item background
    disabled: "#d3d3d3", // Disabled component background
    focus: "#ffebee", // Focused element highlight
  },
};

export const darkPalette = {
  mode: "dark",
  primary: {
    main: "#cccccc", // Light gray for headings
    light: "#fefefe", // Lighter gray for hover or highlights
    dark: "#fefefe", // Medium gray for other elements
  },
  background: {
    default: "#121212", // Black body background
    paper: "#1a1a1a", // Dark gray for cards
    appBar: "#1a1a1a", // Match body for app bars
    drawer: "#1a1a1a", // Darker gray for the sidebar
  },
  text: {
    primary: "#d3d3d3", // Light gray for simple text
    secondary: "#888888", // Medium gray for subtext
    subtext: "#aaaaaa", // Slightly lighter gray for hints or less emphasis
    disabled: "#555555", // Disabled text
    link: "#ff5252", // Bright red for links
  },
  divider: "#333333", // Divider lines
  action: {
    hover: "#444444", // Darker background with lighter text on hover
    selected: "#555555", // Selected item background
    disabled: "#2e2e2e", // Disabled component background
    focus: "#661111", // Focused component highlight
  },
};
