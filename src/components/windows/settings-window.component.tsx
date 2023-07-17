import { createSignal, Match, onMount, Switch } from "solid-js";
import { styled } from "solid-styled-components";
import { SettingsGeneral, SettingsHeader } from "~/components/modules";
import { SettingsAbout } from "~/components/modules/settings/settings-about.component";
import { SettingsAccount } from "~/components/modules/settings/settings-account.component";
import { __macos__, __windows__ } from "~/constants";
import { InvokeService } from "~/services";
import { ThemeMode, themeStore } from "~/store";
import { SettingsView } from "~/types";
import { cssTheme } from "~/util";

const SWrapper = styled("div")<{ themeMode: ThemeMode }>`
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  border-radius: ${__macos__ ? "12px" : "0"};
  border: ${(props) =>
    __macos__ ? "0.5px solid props.theme?.colors.gray2" : undefined};

  ${(props) =>
    __macos__
      ? cssTheme(
          props.themeMode,
          "background: rgba(29, 29, 32, 0.8)",
          "background: rgba(215, 220, 228, 0.8)"
        )
      : cssTheme(
          props.themeMode,
          "background: rgba(19, 19, 22, 1)",
          "background: rgba(215, 220, 228, 1)"
        )};
`;

const SContentWrapper = styled("div")`
  padding: 0 40px;
  height: calc(100vh - 120px);
  margin-top: 16px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
    -webkit-appearance: none;
  }

  & > div {
    padding-bottom: 40px;
  }
`;

const STitleBar = styled("div")`
  height: 20px;
  margin-bottom: 24px;
`;

export const SettingsWindow = () => {
  const { themeMode } = themeStore;

  const [view, setView] = createSignal(
    (() => {
      const searchParams = new URLSearchParams(location.search);

      const view = searchParams.get("view");

      if (view) {
        return view as SettingsView;
      }

      return SettingsView.General;
    })()
  );

  onMount(() => {
    setTimeout(() => {
      InvokeService.shared.openSettingsWindow();
    });
  });

  return (
    <SWrapper themeMode={themeMode()}>
      <STitleBar />
      <SettingsHeader view={view()} onChange={setView} />
      <SContentWrapper>
        <Switch>
          <Match when={view() === SettingsView.General}>
            <SettingsGeneral />
          </Match>
          <Match when={view() === SettingsView.Account}>
            <SettingsAccount />
          </Match>
          <Match when={view() === SettingsView.About}>
            <SettingsAbout />
          </Match>
        </Switch>
      </SContentWrapper>
    </SWrapper>
  );
};
