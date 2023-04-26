import { ThemeMode } from "~/store";

export const cssTheme = (themeMode: ThemeMode, dark: string, light: string) => {
  if (themeMode === ThemeMode.Dark) {
    return `${dark};`;
  }

  if (themeMode === ThemeMode.Light) {
    return `${light};`;
  }

  return `
    ${dark};
    @media (prefers-color-scheme: light) {
      ${light};
    }
  `;
};
