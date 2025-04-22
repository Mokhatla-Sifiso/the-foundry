export const theme = {
  fonts: {
    primary: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  colors: {
    text: {
      primary: "#212121",
      secondary: "#666666",
      tertiary: "#888888",
      quaternary: "#aaaaaa",
      quinary: "#bbbbbb",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f5f5f5",
      tertiary: "#e0e0e0",
      quaternary: "#d0d0d0",
      quinary: "#c0c0c0",
    },
    fontWeights: {
      body: 400,
    },
  },
  colorScheme: "light dark",
};

export type Theme = typeof theme;
