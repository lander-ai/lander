import { Component } from "solid-js";
import { DefaultTheme, keyframes, styled } from "solid-styled-components";
import { space, SpaceProps } from "styled-system";

type StyledProps = SpaceProps;

const SWrapper = styled("div")<StyledProps>`
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  gap: 4px;
  width: max-content;
  padding: 8px 10px;
  background: ${(props) => props.theme?.colors.gray4};
  border-radius: 16px;

  ${space};
`;

const pulse = (theme: DefaultTheme) => keyframes`
  0% {
    background: ${theme.colors.gray2};
  }

  25% {
    background: ${theme.colors.text};
  }

  50% {
    background: ${theme.colors.gray2};
  }

  100% {
    background: ${theme.colors.gray2};
  }
`;

const SDot = styled("div")<{ index: number }>`
  width: 8px;
  height: 8px;
  background: ${(props) => props.theme?.colors.gray2};
  border-radius: 50%;
  animation: ${(props) => `6s infinite ${pulse(props.theme as DefaultTheme)}`};
  animation-delay: ${(props) => props.index * 2}s;
`;

type Props = StyledProps;

export const ChatMessageLoader: Component<Props> = (rest) => {
  return (
    <SWrapper {...rest}>
      <SDot index={0} />
      <SDot index={1} />
      <SDot index={2} />
    </SWrapper>
  );
};
