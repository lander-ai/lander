import { Component, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { router, ThemeMode, themeStore, View } from "~/store";
import { cssTheme } from "~/util";
import { FooterChat } from "./footer-chat.component";
import { FooterCommand } from "./footer-command.component";

const SWrapper = styled("div")<{ themeMode: ThemeMode }>`
  min-height: 36px;
  box-sizing: border-box;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${(props) => props.theme?.colors.gray2};
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  display: grid;
  align-items: center;

  ${(props) =>
    cssTheme(
      props.themeMode,
      "background: 'linear-gradient(90deg, rgba(64, 59, 59, 0.2) 40%, rgb(26, 25, 25, 0.6) 100%)'",
      "background: 'linear-gradient(90deg, rgba(255, 236, 236, 0.2) 40%, rgb(255, 236, 236, 0.6) 100%)'"
    )};
`;

export const Footer: Component = () => {
  const { themeMode } = themeStore;
  const { view } = router;

  return (
    <SWrapper themeMode={themeMode()}>
      <Show when={view() === View.Chat} fallback={<FooterCommand />}>
        <FooterChat />
      </Show>
    </SWrapper>
  );
};
