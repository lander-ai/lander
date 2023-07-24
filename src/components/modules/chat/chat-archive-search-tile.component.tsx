import { Component, createMemo } from "solid-js";
import { styled } from "solid-styled-components";
import { Text } from "~/components/atoms";
import { Thread, ThreadMessage, ThreadMessageAuthor } from "~/models";
import { mouseStore } from "~/store";
import { chatStore } from "~/store/chat.store";

const SWrapper = styled("div")`
  display: grid;
  gap: 16px;
  grid-template-columns: max-content 1fr;
  align-items: center;
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

interface SMessageWrapperProps {
  hoverEnabled: boolean;
  highlighted: boolean;
}

const SMessageWrapper = styled("div")<SMessageWrapperProps>`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr max-content;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;

  &:hover {
    background: ${(props) =>
      props.hoverEnabled ? `${props.theme?.colors.gray}22` : undefined};
  }

  &:active {
    background: ${(props) => props.theme?.colors.gray}33;
  }

  background: ${(props) =>
    props.highlighted ? `${props.theme?.colors.gray}33` : undefined};
`;

const STitle = styled(Text.Callout)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

interface Props {
  message: ThreadMessage;
  thread: Thread;
  onClick: (thread: Thread, message: ThreadMessage) => void;
}

export const ChatArchiveSearchTile: Component<Props> = (props) => {
  const { highlightedArchiveTile } = chatStore;
  const { isMouseActive } = mouseStore;

  const title = createMemo(() => {
    return props.message.content;
  });

  const subtitle = createMemo(() => {
    const command = props.thread.command;

    if (command?.application) {
      return `${command.title} (from ${command.application.name})`;
    }

    return "Chat with AI";
  });

  const highlightedMessage = () => {
    const highlightedTile = highlightedArchiveTile();

    if (highlightedTile && "message" in highlightedTile) {
      return highlightedTile.message;
    }
  };

  return (
    <SWrapper>
      <STextAvatar>
        <Text.Caption fontWeight="medium">
          {props.message.author === ThreadMessageAuthor.AI ? "AI" : ":)"}
        </Text.Caption>
      </STextAvatar>

      <SMessageWrapper
        id={`lander__archive-${props.message.id}`}
        hoverEnabled={isMouseActive()}
        onClick={() => props.onClick(props.thread, props.message)}
        highlighted={highlightedMessage()?.id === props.message.id}
      >
        <div>
          <STitle>{title()}</STitle>
          <Text.Caption mt="4px" color="gray">
            {subtitle()}
          </Text.Caption>
        </div>
        <Text.Caption color="gray">View →</Text.Caption>
      </SMessageWrapper>
    </SWrapper>
  );
};
