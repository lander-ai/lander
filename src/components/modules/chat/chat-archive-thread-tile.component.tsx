import { Component, createMemo, createSignal, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Icon, Text } from "~/components/atoms";
import { Thread } from "~/models";
import { mouseStore } from "~/store";
import { chatStore } from "~/store/chat.store";

const SWrapper = styled("div")`
  display: grid;
  gap: 16px;
  grid-template-columns: max-content 1fr;
  align-items: center;
`;

const SIconWrapper = styled("div")`
  display: grid;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
  border: 1px solid ${(props) => props.theme?.colors.gray};
  border-radius: 50%;
  box-sizing: border-box;

  &:hover {
    background: ${(props) => props.theme?.colors.gray4};
  }
`;

interface SThreadWrapperProps {
  hoverEnabled: boolean;
  highlighted: boolean;
}

const SThreadWrapper = styled("div")<SThreadWrapperProps>`
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

interface Props {
  thread: Thread;
  onClick: (thread: Thread) => void;
  onDelete: (thread: Thread) => void;
}

export const ChatArchiveThreadTile: Component<Props> = (props) => {
  const { highlightedArchiveTile } = chatStore;
  const { isMouseActive } = mouseStore;

  const [isDeleteVisible, setIsDeleteVisible] = createSignal(false);

  const title = createMemo(() => {
    const application = props.thread.command?.application;

    if (application) {
      return application.selectedText;
    }

    return props.thread.messages[0].content;
  });

  const subtitle = createMemo(() => {
    const command = props.thread.command;

    if (command?.application) {
      return `${command.title} (from ${command.application.name})`;
    }

    return "Chat with AI";
  });

  const handleDelete = () => {
    if (isDeleteVisible()) {
      props.onDelete(props.thread);
    } else {
      setIsDeleteVisible(true);
    }
  };

  const highlightedThread = () => {
    const highlightedTile = highlightedArchiveTile();

    if (highlightedTile instanceof Thread) {
      return highlightedTile;
    }
  };

  return (
    <SWrapper>
      <SIconWrapper onClick={handleDelete}>
        <Show when={isDeleteVisible()}>
          <Icon strokeWidth="2px" size="16px" name="check" />
        </Show>
        <Show when={!isDeleteVisible()}>
          <Icon size="16px" name="trash-2" />
        </Show>
      </SIconWrapper>

      <SThreadWrapper
        id={`lander__archive-${props.thread.id}`}
        hoverEnabled={isMouseActive()}
        onClick={() => props.onClick(props.thread)}
        highlighted={highlightedThread()?.id === props.thread.id}
      >
        <div>
          <Text.Callout>{title()}</Text.Callout>
          <Text.Caption mt="4px" color="gray">
            {subtitle()}
          </Text.Caption>
        </div>
        <Text.Caption color="gray">View →</Text.Caption>
      </SThreadWrapper>
    </SWrapper>
  );
};
