import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { __macos__ } from "~/constants";
import { router, ThemeMode, themeStore, View } from "~/store";
import { cssTheme } from "~/util";
import { HeaderChat } from "./header-chat.component";
import { HeaderCommand } from "./header-command.component";

const SWrapper = styled("div")<{ themeMode: ThemeMode }>`
  height: 46px;
  padding: 0 16px;
  border: 1px solid ${(props) => props.theme?.colors.gray2};
  border-radius: 8px;
  box-sizing: border-box;
  display: grid;
  z-index: 0;
  overflow: hidden;

  ${(props) =>
    cssTheme(props.themeMode, "background: #19191a", "background: #e6eaf0")};
`;

const SContentWrapper = styled("div")<{ view: View }>`
  display: grid;
  align-items: center;
  grid-template-rows: 46px 46px;
  transform: ${(props) =>
    props.view === View.Command ? "translateY(-46px)" : "translateY(0)"};
  transition: transform 0.4s ease-out;
`;

export const Header: Component = () => {
  const { themeMode } = themeStore;
  const { view } = router;

  return (
    <SWrapper themeMode={themeMode()}>
      <SContentWrapper view={view()}>
        <HeaderChat />
        <HeaderCommand />
      </SContentWrapper>
    </SWrapper>
  );
};
