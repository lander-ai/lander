import { Component, createEffect, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Button, prompt, Text } from "~/components/atoms";
import { __macos__ } from "~/constants";
import { useArchive } from "~/queries";
import { ThreadService } from "~/services/thread.service";
import { router, View } from "~/store";
import { chatStore } from "~/store/chat.store";
import { startNewChat } from "~/util";

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

const SSectionWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 8px;
`;

export const HeaderChat: Component = () => {
  const { refetch: refetchArchive } = useArchive({ enabled: false });

  const { view, navigate } = router;
  const {
    setIsPluginsPanelVisible,
    isArchiveVisible,
    setIsArchiveVisible,
    thread,
  } = chatStore;

  const handleGoBack = () => {
    if (isArchiveVisible()) {
      setIsArchiveVisible(false);
    } else {
      navigate(View.Command);
    }
  };

  createEffect(() => {
    if (view() === View.Command) {
      setIsPluginsPanelVisible(false);
    }
  });

  return (
    <>
      <SWrapper>
        <SSectionWrapper>
          <SBackIconWrapper onClick={handleGoBack}>
            <Text.Callout ml="1px" mb="2px">
              ←
            </Text.Callout>
          </SBackIconWrapper>
          <Show when={!isArchiveVisible()}>
            <Text.Caption color="gray">
              Press {__macos__ ? "⌥" : "⎇"} for shortcuts
            </Text.Caption>
          </Show>
        </SSectionWrapper>

        <Show when={!isArchiveVisible()}>
          <SSectionWrapper>
            <Button
              py="2px"
              onClick={() => setIsArchiveVisible(true)}
              shortcutIndex={0}
            >
              Archive
            </Button>

            <Show when={thread()?.messages.length}>
              <Button py="2px" onClick={() => startNewChat()} shortcutIndex={0}>
                New chat
              </Button>
            </Show>
          </SSectionWrapper>
        </Show>

        <Show when={isArchiveVisible()}>
          <SSectionWrapper>
            <Button
              py="2px"
              onClick={() =>
                prompt({
                  title: "Clear archived chats",
                  body: "Are you sure you want to clear your archived chats?",
                  successText: "Clear",
                  async onSuccess() {
                    await ThreadService.shared.removeAll();
                    await refetchArchive();
                    prompt.close();
                  },
                })
              }
              shortcutIndex={0}
            >
              Clear archive
            </Button>
          </SSectionWrapper>
        </Show>
      </SWrapper>
    </>
  );
};
