import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { router, View } from "~/store";
import { HeaderChat } from "./header-chat.component";
import { HeaderCommand } from "./header-command.component";

const SWrapper = styled("div")`
  height: 42px;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 0.5px solid ${(props) => props.theme?.colors.gray2};
  display: grid;
  z-index: 0;
  overflow: hidden;
`;

const SContentWrapper = styled("div")<{ view: View }>`
  display: grid;
  align-items: center;
  grid-template-rows: 42px 42px;
  transform: ${(props) =>
    props.view === View.Command ? "translateY(-42px)" : "translateY(0)"};
  transition: transform 0.4s ease-out;
`;

export const Header: Component = () => {
  const { view } = router;

  return (
    <SWrapper>
      <SContentWrapper view={view()}>
        <HeaderChat />
        <HeaderCommand />
      </SContentWrapper>
    </SWrapper>
  );
};
