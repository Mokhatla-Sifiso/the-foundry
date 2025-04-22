import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
    :root{
        color-scheme: ${({ theme }) => theme.colorScheme};
    }
    *, *::before, *::after {
            box-sizing: border-box;
    }
 body{
        margin: 0;
        font-family: ${({ theme }) => theme.fonts.primary};
 }
`;
