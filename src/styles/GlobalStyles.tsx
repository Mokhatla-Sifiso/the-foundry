
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* Minimal CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    overflow-x: hidden;
  }


  button {
    background: none;
    border: none;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }


  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
  }


  ol, ul {
    list-style: none;
  }


  a {
    text-decoration: none;
    color: inherit;
  }


  input, button, textarea, select {
    font: inherit;
  }


  :focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 0.25rem;
  }


  :focus:not(:focus-visible) {
    outline: none;
  }


  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }


  .container {
    width: 100%;
    margin: 0 auto;
    padding: 0 1rem;
  }

  @media (min-width: 640px) {
    .container {
      max-width: 640px;
    }
  }

  @media (min-width: 768px) {
    .container {
      max-width: 768px;
    }
  }

  @media (min-width: 1024px) {
    .container {
      max-width: 1024px;
    }
  }

  @media (min-width: 1280px) {
    .container {
      max-width: 1280px;
    }
  }


  html {
    scroll-behavior: smooth;
  }

  ::selection {
    background-color: rgba(59, 130, 246, 0.3);
    color: inherit;
  }
`;