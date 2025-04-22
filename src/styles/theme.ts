export const lightTheme = {
  fonts: {
    body: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  colors: {
    text: "#1a1a1a",
    background: "#ffffff",
  },
  lineHeights: {
    body: 1.5,
  },
  fontWeights: {
    body: 400,
  },
  colorScheme: "light",
};

export const darkTheme = {
  fonts: {
    body: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  colors: {
    text: "rgba(255, 255, 255, 0.87)",
    background: "#242424",
  },
  lineHeights: {
    body: 1.5,
  },
  fontWeights: {
    body: 400,
  },
  colorScheme: "dark",
};

export type Theme = typeof lightTheme;
