import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import {
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

const SWrapper = styled("div")<{ themeMode: ThemeMode }>`
  width: ${__macos__ ? "100vw" : "calc(100vw - 1px)"};
  height: ${__macos__ ? "100vh" : "calc(100vh - 1px)"};
  box-sizing: border-box;
  border-radius: 12px;
  border: 0.5px solid ${(props) => props.theme?.colors.gray2};
  position: relative;
  overflow: hidden;

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

const SContentWrapper = styled("div")<{ view: View }>`
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
  const { isPluginsPanelVisible } = chatStore;

  useKeystrokeHandler();

  useLaunch();

  return (
    <SWrapper themeMode={themeMode()}>
      <Header />
      <SContentWrapper view={view()}>
        <ChatView />
        <CommandView />
      </SContentWrapper>
      <Footer />

      <ChatPluginPanel visible={isPluginsPanelVisible()} />
    </SWrapper>
  );
};
