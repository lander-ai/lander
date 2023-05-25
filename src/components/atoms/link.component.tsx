import { Component, JSX, splitProps } from "solid-js";
import { styled } from "solid-styled-components";
import { ColorProps, SpaceProps, TypographyProps } from "styled-system";
import { Text } from "./text.component";

type StyledProps = SpaceProps & TypographyProps & ColorProps;

const SWrapper = styled(Text.Callout)<{ underline?: boolean }>`
  width: max-content;
  text-underline-offset: 4px;
  ${(props) => (props.underline ? `text-decoration: underline;` : undefined)}

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 0.5;
  }
`;

interface Props
  extends JSX.HTMLAttributes<HTMLDivElement>,
    Omit<StyledProps, "color"> {
  children: JSX.Element;
  underline?: boolean;
}

export const Link: Component<Props> = ($props) => {
  const [props, rest] = splitProps($props, ["children"]);

  return (
    <SWrapper underline {...rest}>
      {props.children}
    </SWrapper>
  );
};
