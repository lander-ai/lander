import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { Text } from "~/components/atoms";
import { router, View } from "~/store";

const SWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  align-items: center;
`;

const SBackIconWrapper = styled("div")`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${(props) => props.theme?.colors.gray4};
  display: grid;
  align-content: center;
  justify-content: center;
  border: ${(props) => `0.5px solid ${props.theme?.colors.gray2}`};

  &:hover {
    background: ${(props) => props.theme?.colors.gray3};
  }
`;

export const HeaderChat: Component = () => {
  const { navigate } = router;

  return (
    <SWrapper>
      <SBackIconWrapper
        onClick={() => {
          navigate(View.Command);
        }}
      >
        <Text.Callout ml="1px" mb="2px">
          ←
        </Text.Callout>
      </SBackIconWrapper>
      <Text.Caption color="gray">Press ⌥ for shortcuts</Text.Caption>
    </SWrapper>
  );
};
