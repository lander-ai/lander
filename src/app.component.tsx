import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Component, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { DefaultTheme, styled, ThemeProvider } from "solid-styled-components";
import { PromptProvider } from "./components";
import { getTheme } from "./components/theme";
import { MainWindow, SettingsWindow } from "./components/windows";
import { StorageService } from "./services";
import { ThemeMode, themeStore } from "./store";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 2000, refetchOnWindowFocus: false } },
});

declare global {
  interface Window {
    LanderView: LanderView;
  }
}

const SWrapper = styled("div")`
  font-family: ${(props) => props.theme?.fontFamily};
`;

enum LanderView {
  Main = "Main",
  Settings = "Settings",
}

export const App: Component = () => {
  const { setThemeMode } = themeStore;

  const [theme, setTheme] = createStore<DefaultTheme>(
    getTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? ThemeMode.Dark
        : ThemeMode.Light
    )
  );

  onMount(async () => {
    const themeMode =
      ((await StorageService.shared.get("theme")) as ThemeMode) ||
      ThemeMode.System;

    setThemeMode(themeMode);

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? ThemeMode.Dark
      : ThemeMode.Light;

    setTheme(
      !themeMode || themeMode === ThemeMode.System
        ? getTheme(systemTheme)
        : getTheme(themeMode)
    );

    if (themeMode === ThemeMode.System) {
      const handleThemeChange = (event: MediaQueryListEvent) => {
        setTheme(
          event.matches ? getTheme(ThemeMode.Dark) : getTheme(ThemeMode.Light)
        );
      };

      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", handleThemeChange);
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SWrapper>
          <PromptProvider>
            {window.LanderView === LanderView.Main ? (
              <MainWindow />
            ) : (
              <SettingsWindow />
            )}
          </PromptProvider>
        </SWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
