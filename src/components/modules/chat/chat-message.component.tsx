import { open } from "@tauri-apps/api/shell";
import remarkGfm from "remark-gfm";
import { Component, createMemo, createSignal, For, Show } from "solid-js";
import SolidMarkdown from "solid-markdown";
import { styled } from "solid-styled-components";
import icon from "~/assets/icon.png";
import {
  Button,
  Icon,
  Link,
  SyntaxHighlight,
  Tag,
  Text,
} from "~/components/atoms";
import { ThreadMessage, ThreadMessageAuthor } from "~/models";
import { mouseStore } from "~/store";
import { chatStore } from "~/store/chat.store";
import { ChatMessageLoader } from "./chat-message-loader.component";
import { ChatMessageMenu } from "./chat-message-menu.component";

const SWrapper = styled("div")<{ hoverEnabled: boolean; selected?: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme?.colors.gray5 : undefined};
`;

const SContentWrapper = styled("div")`
  display: grid;
  gap: 16px;
  padding: 16px;
  grid-template-columns: max-content calc(100vw - 72px);
`;

const SCopyBlocker = styled("div")`
  position: absolute;
  user-select: text;
  height: 100%;
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

const SChevron = styled(Icon)<{ rotation: "up" | "down" }>`
  margin-left: -8px;
  transform: ${(props) => `rotate(${props.rotation === "down" ? 0 : -180}deg)`};
  transition: transform 0.4s;
`;

const SContentMarkdownWrapper = styled("div")`
  * {
    user-select: text;
    -webkit-user-select: text;
    cursor: text;
  }
`;

const SContentTextWrapper = styled("div")`
  margin-top: 8px;
`;

const SPluginsWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  align-items: center;
  margin: 8px 0;
  gap: 8px;
  width: max-content;
`;

const SLink = styled(Link)`
  display: inline-block;
  cursor: default;
`;

const SLi = styled("li")`
  margin-top: 4px;
  color: ${(props) => props.theme?.colors.text};
  font-weight: 500;
  font-size: 14px;
`;

interface Props {
  message: ThreadMessage;
  onRetry: () => void;
}

export const ChatMessage: Component<Props> = (props) => {
  const { isMouseActive } = mouseStore;
  const { thread, highlightedMessage, setHighlightedMessage } = chatStore;

  const [isDetailsVisible, setIsDetailsVisible] = createSignal(false);

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

  const plugins = createMemo(() => {
    const messages = thread()?.messages;

    return messages?.find((m) => m.id === props.message.id)?.plugins;
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
            <Text.Caption
              fontWeight="medium"
              content={(avatar() as { initials: string }).initials}
            />
          </STextAvatar>
        )}

        <div>
          <Text.Callout fontWeight="600" onCopy={() => false}>
            {title()}
          </Text.Callout>

          <Show when={plugins()?.length}>
            <SPluginsWrapper
              onClick={() => setIsDetailsVisible((prev) => !prev)}
            >
              <For each={[...new Set(plugins()?.map((plugin) => plugin.name))]}>
                {(pluginName) => <Tag>{pluginName}</Tag>}
              </For>
              <SChevron
                name="chevron-small-down"
                size="24px"
                rotation={isDetailsVisible() ? "up" : "down"}
              />
            </SPluginsWrapper>

            <Show when={isDetailsVisible()}>
              <div>
                <For each={plugins()}>
                  {(plugin) => (
                    <Text.Callout color="gray">
                      {plugin.name} – "{plugin.input}"
                    </Text.Callout>
                  )}
                </For>
              </div>
            </Show>
          </Show>

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
                <SContentMarkdownWrapper>
                  <SolidMarkdown
                    children={content}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1(props) {
                        return (
                          <SContentTextWrapper>
                            <Text.Title>{props.children}</Text.Title>
                          </SContentTextWrapper>
                        );
                      },
                      h2(props) {
                        return (
                          <SContentTextWrapper>
                            <Text.Subtitle>{props.children}</Text.Subtitle>
                          </SContentTextWrapper>
                        );
                      },
                      h3(props) {
                        return (
                          <SContentTextWrapper>
                            <Text.Headline>{props.children}</Text.Headline>
                          </SContentTextWrapper>
                        );
                      },
                      h4(props) {
                        return (
                          <SContentTextWrapper>
                            <Text.Subheadline>
                              {props.children}
                            </Text.Subheadline>
                          </SContentTextWrapper>
                        );
                      },
                      h5(props) {
                        return (
                          <SContentTextWrapper>
                            <Text.Body>{props.children}</Text.Body>
                          </SContentTextWrapper>
                        );
                      },
                      p(props) {
                        return (
                          <SContentTextWrapper>
                            <Text.Callout>{props.children}</Text.Callout>
                          </SContentTextWrapper>
                        );
                      },
                      a(props) {
                        return (
                          <SLink
                            underline
                            onClick={
                              props.href ? () => open(props.href!) : undefined
                            }
                          >
                            {props.children}
                          </SLink>
                        );
                      },
                      li(props) {
                        return <SLi>{props.children}</SLi>;
                      },
                      code(props) {
                        return (
                          <SyntaxHighlight
                            language={props.lang}
                            inline={props.inline}
                            mt="4px"
                          >
                            {String(props.children).replace(/\n$/, "")}
                          </SyntaxHighlight>
                        );
                      },
                    }}
                  />
                  <SCopyBlocker />
                </SContentMarkdownWrapper>
              </Show>
            )}
          </Show>
        </div>
      </SContentWrapper>
    </SWrapper>
  );
};
