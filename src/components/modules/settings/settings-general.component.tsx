import { relaunch } from "@tauri-apps/api/process";
import {
  Component,
  createResource,
  createSignal,
  onMount,
  Show,
} from "solid-js";
import { styled } from "solid-styled-components";
import { grid, GridProps } from "styled-system";
import {
  disable as disableAutostart,
  enable as enableAutostart,
  isEnabled as isAutostartEnabled,
} from "tauri-plugin-autostart-api";
import themeDarkModeImage from "~/assets/settings/theme-dark-mode.webp";
import themeLightModeImage from "~/assets/settings/theme-light-mode.webp";
import themeSystemModeImage from "~/assets/settings/theme-system-mode.webp";
import { Button, Checkbox, Hotkey, Text } from "~/components/atoms";
import { InvokeService, StorageService } from "~/services";
import { ThemeMode, themeStore } from "~/store";

const SRow = styled("div")<GridProps>`
  display: grid;
  grid-auto-flow: column;
  align-items: start;
  justify-content: start;
  ${grid};
`;

const SSection = styled("div")`
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: start;
  justify-content: start;
  padding: 24px 0;
  border-bottom: 1px solid ${(props) => props.theme?.colors.gray3};
`;

const SThemeImagesWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  gap: 16px;
`;

const SThemeImage = styled("img")<{ selected: boolean }>`
  width: 140px;
  height: 140px;
  border-radius: 16px;
  padding: 4px;
  border: 1px solid
    ${(props) =>
      props.selected ? props.theme?.colors.gray : props.theme?.colors.gray3};

  &:hover {
    border: 1px solid ${(props) => props.theme?.colors.gray};
  }
`;

export const SettingsGeneral: Component = () => {
  const { themeMode: prevThemeMode } = themeStore;

  const [themeMode, setThemeMode] = createSignal<ThemeMode>();

  const [mainWindowHotkey] = createResource(
    () => StorageService.shared.get("main_window_hotkey") as Promise<string>
  );

  let autostartRef: HTMLInputElement | undefined;

  onMount(async () => {
    if (autostartRef) {
      autostartRef.checked = await isAutostartEnabled();
    }

    const theme = (await StorageService.shared.get("theme")) as ThemeMode;

    setThemeMode(theme || ThemeMode.System);
  });

  const handleToggleAutostart = (value: boolean) => {
    if (value) {
      enableAutostart();
    } else {
      disableAutostart();
    }
  };

  const handleRegisterHotkey = async (value: string[]) => {
    const tauriHotkey = value
      .map((key) => (key === "Meta" ? "Super" : key))
      .join("+");

    await InvokeService.shared.registerMainWindowHotkey(tauriHotkey);

    await StorageService.shared.set("main_window_hotkey", tauriHotkey);

    await StorageService.shared.save();
  };

  const handleChangeTheme = async (theme: ThemeMode) => {
    setThemeMode(theme);
  };

  const handleRelaunch = async () => {
    await StorageService.shared.set("theme", themeMode());
    await StorageService.shared.save();
    await relaunch();
  };

  return (
    <div>
      <SSection>
        <Text.Caption color="gray">Startup</Text.Caption>

        <SRow gridGap="16px">
          <Checkbox
            ref={autostartRef}
            onChange={(event) => {
              handleToggleAutostart(event.currentTarget.checked);
            }}
            type="checkbox"
          />
          <Text.Callout fontWeight="medium" color="gray">
            Launch Lander at login
          </Text.Callout>
        </SRow>
      </SSection>

      <SSection>
        <Text.Caption color="gray">Hotkey</Text.Caption>

        <div>
          <Show when={!mainWindowHotkey.loading}>
            <Hotkey
              onChange={handleRegisterHotkey}
              defaultValue={mainWindowHotkey()}
            />
            <Text.Callout mt="8px" color="gray">
              Set hotkey to launch Lander
            </Text.Callout>
          </Show>
        </div>
      </SSection>

      <SSection>
        <Text.Caption color="gray">Theme</Text.Caption>

        <div>
          <Show when={prevThemeMode() !== themeMode()}>
            <Text.Callout fontWeight="medium">
              Please relaunch the app to view changes
            </Text.Callout>

            <Button mt="16px" mb="24px" onClick={handleRelaunch}>
              Set & Relaunch
            </Button>
          </Show>

          <SThemeImagesWrapper>
            <div>
              <SThemeImage
                src={themeSystemModeImage}
                selected={themeMode() === ThemeMode.System}
                onClick={() => handleChangeTheme(ThemeMode.System)}
              />
              <Text.Callout mt="4px" fontWeight="medium" textAlign="center">
                System
              </Text.Callout>
            </div>

            <div>
              <SThemeImage
                src={themeDarkModeImage}
                selected={themeMode() === ThemeMode.Dark}
                onClick={() => handleChangeTheme(ThemeMode.Dark)}
              />
              <Text.Callout mt="4px" fontWeight="medium" textAlign="center">
                Dark
              </Text.Callout>
            </div>

            <div>
              <SThemeImage
                src={themeLightModeImage}
                selected={themeMode() === ThemeMode.Light}
                onClick={() => handleChangeTheme(ThemeMode.Light)}
              />
              <Text.Callout mt="4px" fontWeight="medium" textAlign="center">
                Light
              </Text.Callout>
            </div>
          </SThemeImagesWrapper>
        </div>
      </SSection>
    </div>
  );
};
