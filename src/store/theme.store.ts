import { createRoot, createSignal } from "solid-js";

export enum ThemeMode {
  Light = "Light",
  Dark = "Dark",
  System = "System",
}

export const themeStore = createRoot(() => {
  const [themeMode, setThemeMode] = createSignal(ThemeMode.System);

  return { themeMode, setThemeMode };
});
