import { Component, JSX, splitProps } from "solid-js";
import { styled } from "solid-styled-components";
import { Text } from "./text.component";

const SWrapper = styled.div`
  padding: 4px 8px;
  background: ${(props) => props.theme?.colors.gray4};
  width: max-content;
  border-radius: 16px;
`;

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {
  children: string;
}

export const Tag: Component<Props> = ($props) => {
  const [props, rest] = splitProps($props, ["children"]);

  return (
    <SWrapper {...rest}>
      <Text.Callout>{props.children}</Text.Callout>
    </SWrapper>
  );
};
