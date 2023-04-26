import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { ChatView, CommandView, Footer, Header } from "~/components/modules";
import { router, ThemeMode, themeStore, View } from "~/store";
import { cssTheme, useKeystrokeHandler, useLaunch } from "~/util";

const SWrapper = styled("div")<{ themeMode: ThemeMode }>`
  width: calc(100vw);
  height: calc(100vh);
  box-sizing: border-box;
  border-radius: 12px;
  border: 0.5px solid ${(props) => props.theme?.colors.gray2};
  position: relative;

  ${(props) =>
    cssTheme(
      props.themeMode,
      "background: rgba(29, 29, 32, 0.8)",
      "background: rgba(215, 220, 228, 0.8)"
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
    </SWrapper>
  );
};
