import { createSignal, Match, onMount, Switch } from "solid-js";
import { styled } from "solid-styled-components";
import {
  SettingsGeneral,
  SettingsHeader,
  SettingsView,
} from "~/components/modules";
import { SettingsAccount } from "~/components/modules/settings/settings-account.component";
import { InvokeService } from "~/services";
import { ThemeMode, themeStore } from "~/store";
import { cssTheme } from "~/util";

const SWrapper = styled("div")<{ themeMode: ThemeMode }>`
  height: 100vh;
  box-sizing: border-box;
  border-radius: 12px;
  border: 0.5px solid ${(props) => props.theme?.colors.gray2};

  ${(props) =>
    cssTheme(
      props.themeMode,
      "background: rgba(29, 29, 32, 0.8)",
      "background: rgba(215, 220, 228, 0.8)"
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
  const [view, setView] = createSignal(SettingsView.Account);

  onMount(() => {
    InvokeService.shared.openSettingsWindow();
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
        </Switch>
      </SContentWrapper>
    </SWrapper>
  );
};
