import { Component, JSX, splitProps } from "solid-js";
import { styled } from "solid-styled-components";
import { ColorProps, SpaceProps, TypographyProps } from "styled-system";
import { Text } from "./text.component";

type StyledProps = SpaceProps & TypographyProps & ColorProps;

const SWrapper = styled(Text.Callout)`
  width: max-content;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
    color: ${(props) => props.theme?.colors.gray};
  }
`;

interface Props
  extends JSX.HTMLAttributes<HTMLDivElement>,
    Omit<StyledProps, "color"> {
  children: JSX.Element;
}

export const Link: Component<Props> = ($props) => {
  const [props, rest] = splitProps($props, ["children"]);

  return <SWrapper {...rest}>{props.children}</SWrapper>;
};
