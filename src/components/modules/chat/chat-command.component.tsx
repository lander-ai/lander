import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Component, createMemo, createSignal, Show } from "solid-js";
import { styled } from "solid-styled-components";
import logo from "~/assets/icon.png";
import { Button, Icon, Text } from "~/components/atoms";
import { Command } from "~/models";
import { InvokeService } from "~/services";
import { commandStore } from "~/store";
import { chatStore } from "~/store/chat.store";
import { chatCommand } from "~/util/ai-commands";

const SWrapper = styled("div")`
  display: grid;
  gap: 16px;
  padding: 16px;
  grid-template-columns: max-content 1fr max-content;
`;

const SIconAvatar = styled("img")`
  height: 24px;
  width: 24px;
`;

const ChatButtonsWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  gap: 8px;
  margin: 12px 0;
`;

const SChevron = styled(Icon)<{ rotation: "up" | "down" }>`
  margin-left: 2px;
  stroke: ${(props) => props.theme?.colors.gray};
  transform: ${(props) => `rotate(${props.rotation === "down" ? 0 : -180}deg)`};
  transition: transform 0.4s;
`;

const SContextualTextButton = styled("div")`
  display: grid;
  grid-template-columns: max-content max-content;
  align-items: center;
`;

interface SContextualTextProps {
  visible: boolean;
  maxHeight: string;
}

const SContextualText = styled(Text.Callout)<SContextualTextProps>`
  overflow: hidden;
  white-space: pre-wrap;
  max-height: ${(props) => (props.visible ? props.maxHeight : 0)};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: ${(props) =>
    props.visible
      ? "max-height 0.4s, opacity 0.6s"
      : "max-height 0.2s, opacity 0.4s"};
`;

interface Props {
  command: Command;
}

export const ChatCommand: Component<Props> = (props) => {
  const { thread, contextualText, setContextualText } = chatStore;
  const { focusedApplication, selectedCommand } = commandStore;

  const [isSelectedTextVisible, setIsSelectedTextVisible] = createSignal(false);

  const contextualTextLayout = createMemo(() => {
    const command = selectedCommand();
    const application = command?.application;
    const context = contextualText();

    if (context) {
      return {
        title: `Text from ${context.provider}`,
        text: context.text,
      };
    }

    if (props.command.id === "ai-custom-command") {
      return {
        title: props.command.subtitle,
      };
    }

    if (
      props.command.id !== chatCommand.id &&
      application &&
      application.selectedText
    ) {
      return {
        title: `Selected text from ${application.name}`,
        text: application.selectedText,
      };
    }
  });

  const isChatCommand = createMemo(() => props.command.id === chatCommand.id);

  const icon = createMemo(() => {
    if (props.command.application?.selectedText) {
      return convertFileSrc(props.command.application.icon);
    }

    return logo;
  });

  return (
    <Show
      when={
        isChatCommand() ||
        props.command.id === "ai-custom-command" ||
        props.command.application?.selectedText
      }
    >
      <SWrapper>
        <SIconAvatar draggable={false} src={icon()} />

        <div>
          <Text.Callout fontWeight="600">{props.command.title}</Text.Callout>

          <Show when={props.command.id === chatCommand.id}>
            <Text.Callout color="gray" mt="4px">
              What can I help you with?
            </Text.Callout>

            <Show when={thread()?.messages.length === 0}>
              <ChatButtonsWrapper>
                <Show when={focusedApplication()?.selectedText}>
                  <Button
                    selected={contextualText()?.provider === "selection"}
                    onClick={() =>
                      setContextualText({
                        provider: "selection",
                        text: focusedApplication()?.selectedText || "",
                      })
                    }
                    shortcutIndex={9}
                  >
                    Ask from selected text
                  </Button>
                </Show>
                <Button
                  selected={contextualText()?.provider === "clipboard"}
                  onClick={() => {
                    (async () => {
                      const text =
                        await InvokeService.shared.getClipboardText();
                      if (text) {
                        setContextualText({ provider: "clipboard", text });
                      }
                    })();
                  }}
                  shortcutIndex={13}
                >
                  Ask from clipboard
                </Button>
                <Show when={contextualText()}>
                  <Button
                    onClick={() => {
                      setContextualText(undefined);
                    }}
                    shortcutIndex={0}
                  >
                    Remove
                  </Button>
                </Show>
              </ChatButtonsWrapper>
            </Show>
          </Show>

          <Show when={contextualTextLayout()} keyed>
            {(layout) => (
              <>
                <SContextualTextButton>
                  <Text.Callout
                    color="gray"
                    onClick={() => setIsSelectedTextVisible((prev) => !prev)}
                  >
                    {layout.title}
                  </Text.Callout>
                  <Show when={layout.text}>
                    {" "}
                    <SChevron
                      name="chevron-small-down"
                      size="24px"
                      rotation={isSelectedTextVisible() ? "up" : "down"}
                    />
                  </Show>
                </SContextualTextButton>

                <Show when={layout.text} keyed>
                  {(text) => (
                    <SContextualText
                      visible={isSelectedTextVisible()}
                      maxHeight={`${
                        (Math.ceil(text.length / 80) +
                          text.split("\n").length) *
                        40
                      }px`}
                      mt="4px"
                      color="gray"
                    >
                      {text}
                    </SContextualText>
                  )}
                </Show>
              </>
            )}
          </Show>
        </div>
      </SWrapper>
    </Show>
  );
};
