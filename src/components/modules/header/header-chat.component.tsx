import { Component, createEffect, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Button, Text } from "~/components/atoms";
import { __macos__ } from "~/constants";
import { useUser } from "~/queries";
import { router, View } from "~/store";
import { chatStore } from "~/store/chat.store";

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

const SRightWrapper = styled("div")``;

export const HeaderChat: Component = () => {
  const user = useUser();

  const { view, navigate } = router;
  const { setIsPluginsPanelVisible, selectedPlugins } = chatStore;

  const handleTogglePlugins = () => {
    if (view() === View.Chat) {
      setIsPluginsPanelVisible((prev) => !prev);
    }
  };

  createEffect(() => {
    if (view() === View.Command) {
      setIsPluginsPanelVisible(false);
    }
  });

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

      <SRightWrapper>
        <Show when={user.data?.subscription}>
          <Button
            py="2px"
            onClick={handleTogglePlugins}
            shortcutIndex={0}
            selected={!!selectedPlugins().size}
          >
            Plugins
          </Button>
        </Show>

        <Show when={!user.data?.subscription}>
          <Text.Caption color="gray">
            Press {__macos__ ? "⌥" : "⎇"} for shortcuts
          </Text.Caption>
        </Show>
      </SRightWrapper>
    </SWrapper>
  );
};
