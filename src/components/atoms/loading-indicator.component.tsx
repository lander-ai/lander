import { Component, splitProps } from "solid-js";
import { keyframes, styled } from "solid-styled-components";
import { space, SpaceProps } from "styled-system";

type StyledProps = SpaceProps;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SLoader = styled("div")<{ size: string }>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  box-sizing: border-box;
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme?.colors.gray};
  border-top: 2px solid ${(props) => props.theme?.colors.text};
  animation: ${spin} 2s linear infinite;

  ${space};
`;

interface Props extends StyledProps {
  size: string;
}

export const LoadingIndicator: Component<Props> = ($props) => {
  const [props, rest] = splitProps($props, ["size"]);

  return <SLoader size={props.size} {...rest} />;
};
