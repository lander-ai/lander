import { DefaultTheme } from "solid-styled-components";
import { ThemeMode } from "~/store";
import { theme } from "./base.theme";

export const getTheme = (mode: ThemeMode): DefaultTheme => {
  if (mode === ThemeMode.Dark) {
    return { ...theme, colors: theme.colors.modes.dark };
  }

  const { modes: _, ...colors } = theme.colors;

  return { ...theme, colors };
};
