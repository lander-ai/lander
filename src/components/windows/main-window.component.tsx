import { Component, Show } from "solid-js";
import { styled } from "solid-styled-components";
import {
  ChatArchiveView,
  ChatPluginPanel,
  ChatView,
  CommandView,
  Footer,
  Header,
} from "~/components/modules";
import { __macos__ } from "~/constants";
import { router, ThemeMode, themeStore, View } from "~/store";
import { chatStore } from "~/store/chat.store";
import { cssTheme, useKeystrokeHandler, useLaunch } from "~/util";

const SWrapper = styled("div")`
  width: ${__macos__ ? "100vw" : "calc(100vw - 1px)"};
  height: ${__macos__ ? "100vh" : "calc(100vh - 1px)"};
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;

const SContentWrapper = styled("div")<{ themeMode: ThemeMode }>`
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme?.colors.gray2};

  ${(props) =>
    cssTheme(props.themeMode, "background: #19191a", "background: #e6eaf0")};
`;

const SPageWrapper = styled("div")<{ view: View; themeMode: ThemeMode }>`
  display: grid;
  grid-template-columns: 100% 100%;
  grid-template-rows: 100vh;
  transform: ${(props) =>
    props.view === View.Command ? "translateX(-100%)" : "translateX(0)"};
  transition: transform 0.4s ease-out;
`;

export const MainWindow: Component = () => {
  const { themeMode } = themeStore;
  const { view } = router;
  const { isPluginsPanelVisible, isArchiveVisible } = chatStore;

  useKeystrokeHandler();

  useLaunch();

  return (
    <SWrapper>
      <Header />

      <SContentWrapper themeMode={themeMode()}>
        <SPageWrapper view={view()} themeMode={themeMode()}>
          <Show when={!isArchiveVisible()}>
            <ChatView />
          </Show>
          <Show when={isArchiveVisible()}>
            <ChatArchiveView />
          </Show>
          <CommandView />
        </SPageWrapper>
      </SContentWrapper>

      <Footer />

      <ChatPluginPanel visible={isPluginsPanelVisible()} />
    </SWrapper>
  );
};
