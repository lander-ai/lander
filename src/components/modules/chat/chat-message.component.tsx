import { Component, createMemo, For, Match, Show, Switch } from "solid-js";
import { styled } from "solid-styled-components";
import icon from "~/assets/icon.png";
import { Button, SyntaxHighlight, Text } from "~/components/atoms";
import { ThreadMessage, ThreadMessageAuthor } from "~/models";
import { mouseStore } from "~/store";
import { chatStore } from "~/store/chat.store";
import { MessageSectionType, parseMessage } from "~/util";
import { ChatMessageLoader } from "./chat-message-loader.component";
import { ChatMessageMenu } from "./chat-message-menu.component";

const SWrapper = styled("div")<{ hoverEnabled: boolean; selected?: boolean }>`
  background: ${(props) =>
    props.selected ? `${props.theme?.colors.background}14` : undefined};
`;

const SContentWrapper = styled("div")`
  display: grid;
  gap: 16px;
  padding: 16px;
  grid-template-columns: max-content calc(100vw - 72px);
`;

const SIconAvatar = styled("img")`
  height: 24px;
  width: 24px;
`;

const STextAvatar = styled("div")`
  height: 24px;
  width: 24px;
  border-radius: 50%;
  display: grid;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme?.colors.gray3};
`;

const SContentTilesWrapper = styled("div")`
  margin-top: 4px;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
`;

const SContentText = styled(Text.Callout)`
  display: inline;
  white-space: pre-wrap;

  &::selection {
    background: ${(props) => props.theme?.colors.gray};
  }
`;

interface Props {
  message: ThreadMessage;
  onRetry: () => void;
}

export const ChatMessage: Component<Props> = (props) => {
  const { isMouseActive } = mouseStore;
  const { thread, highlightedMessage, setHighlightedMessage } = chatStore;

  const avatar = createMemo<{ icon: string } | { initials: string }>(() =>
    props.message.author === ThreadMessageAuthor.AI
      ? { icon }
      : { initials: ":)" }
  );

  const title = createMemo(() => {
    return props.message.author === ThreadMessageAuthor.User ? "You" : "AI";
  });

  const content = createMemo(() => {
    const messages = thread()?.messages;

    const content = messages?.find((m) => m.id === props.message.id)?.content;

    if (content) {
      return content;
    }

    return props.message.content;
  });

  const isError = createMemo(
    () =>
      props.message.author === ThreadMessageAuthor.AI &&
      content().includes("[LANDER_STREAM_ERROR]")
  );

  const isSelected = createMemo(
    () => highlightedMessage()?.id === props.message.id
  );

  return (
    <SWrapper
      id={`lander__chat-${props.message.id}`}
      selected={isSelected()}
      hoverEnabled={isMouseActive()}
      onMouseOver={() =>
        isMouseActive() && setHighlightedMessage(props.message)
      }
    >
      <Show when={!isError() && isSelected()}>
        <ChatMessageMenu message={props.message} />
      </Show>
      <SContentWrapper>
        {"icon" in avatar() ? (
          <SIconAvatar
            draggable={false}
            src={(avatar() as { icon: string }).icon}
          />
        ) : (
          <STextAvatar>
            <Text.Caption fontWeight="medium">
              {(avatar() as { initials: string }).initials}
            </Text.Caption>
          </STextAvatar>
        )}

        <div>
          <Text.Callout fontWeight="600">{title()}</Text.Callout>

          <Show
            when={content()}
            fallback={
              props.message.author === ThreadMessageAuthor.AI ? (
                <ChatMessageLoader mt="8px" />
              ) : null
            }
            keyed
          >
            {(content) => (
              <Show
                when={!isError()}
                fallback={
                  <>
                    <Text.Callout mt="4px" color="orange">
                      Oops, something's not working right
                    </Text.Callout>
                    <Button mt="8px" onClick={props.onRetry} shortcutIndex={1}>
                      Try again
                    </Button>
                  </>
                }
              >
                <SContentTilesWrapper>
                  <For each={parseMessage(content)}>
                    {(section) => (
                      <Switch>
                        <Match when={section.type === MessageSectionType.Text}>
                          <SContentText color="gray">
                            {section.content}
                          </SContentText>
                        </Match>
                        <Match
                          when={
                            section.type === MessageSectionType.Code ||
                            section.type === MessageSectionType.InlineCode
                          }
                        >
                          <SyntaxHighlight
                            language={section.code?.language}
                            inline={
                              section.type === MessageSectionType.InlineCode
                            }
                            my={
                              section.type === MessageSectionType.Code
                                ? "12px"
                                : "0"
                            }
                          >
                            {section.content}
                          </SyntaxHighlight>
                        </Match>
                      </Switch>
                    )}
                  </For>
                </SContentTilesWrapper>
              </Show>
            )}
          </Show>
        </div>
      </SContentWrapper>
    </SWrapper>
  );
};
