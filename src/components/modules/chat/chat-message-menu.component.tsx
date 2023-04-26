import { Component, createMemo, createSignal, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { border, BorderProps, space, SpaceProps } from "styled-system";
import { Icon, Shortcut, Text, Tooltip } from "~/components/atoms";
import { ThreadMessage } from "~/models";
import { InvokeService } from "~/services";
import { commandStore, shortcutStore } from "~/store";

const STooltipWrapper = styled("div")`
  position: relative;
  right: 16px;
  top: -16px;
  float: right;
  display: grid;
  align-self: start;
  align-items: center;
  align-content: center;
  grid-auto-flow: column;
  justify-content: start;
`;

interface SIconProps extends SpaceProps, BorderProps {
  disabled?: boolean;
}

const SIcon = styled(Icon)<SIconProps>`
  background: ${(props) => props.theme?.colors.gray4};
  overflow: hidden;
  stroke: ${(props) =>
    !props.disabled ? props.theme?.colors.text : props.theme?.colors.gray};
  ${space};
  ${border};

  &:hover {
    background: ${(props) =>
      !props.disabled ? props.theme?.colors.gray3 : undefined};
  }

  &:active {
    background: ${(props) =>
      !props.disabled ? props.theme?.colors.gray2 : undefined};
  }
`;

const SShortcutsWrapper = styled("div")`
  position: relative;
  right: 16px;
  top: -16px;
  float: right;
  display: grid;
  gap: 8px;
  padding: 8px 12px;
  background: ${(props) => props.theme?.colors.gray5};
  border-radius: 8px;
`;

interface Props {
  message: ThreadMessage;
}

export const ChatMessageMenu: Component<Props> = (props) => {
  const { isShortcutsVisible } = shortcutStore;
  const { focusedApplication } = commandStore;

  const [isCopied, setIsCopied] = createSignal(false);

  const isInsertDisabled = createMemo(
    () => focusedApplication()?.focusedText === null
  );

  const isReplaceDisabled = createMemo(
    () =>
      !focusedApplication()?.selectedText ||
      focusedApplication()?.focusedText === null
  );

  const handleCopy = () => {
    InvokeService.shared.copyText(props.message.content);
    setIsCopied(true);
  };

  const handleInsert = () => {
    if (isInsertDisabled()) {
      return;
    }

    InvokeService.shared.insertText(props.message.content);
  };

  const handleReplace = () => {
    if (isReplaceDisabled()) {
      return;
    }

    InvokeService.shared.replaceText(props.message.content);
  };

  return (
    <>
      <Show when={!isShortcutsVisible()}>
        <STooltipWrapper>
          <Tooltip message={isCopied() ? "Copied" : "Copy"}>
            <SIcon
              size="20px"
              name="document-clean"
              pl="8px"
              p="6px"
              borderTopLeftRadius="8px"
              borderBottomLeftRadius="8px"
              onClick={handleCopy}
            />
          </Tooltip>

          <Tooltip message="Insert">
            <SIcon
              size="20px"
              name="document-filled"
              p="6px"
              disabled={isInsertDisabled()}
              onClick={handleInsert}
            />
          </Tooltip>

          <Tooltip message="Replace">
            <SIcon
              size="20px"
              name="document-plus"
              p="6px"
              pr="8px"
              borderTopRightRadius="8px"
              borderBottomRightRadius="8px"
              disabled={isReplaceDisabled()}
              onClick={handleReplace}
            />
          </Tooltip>
        </STooltipWrapper>
      </Show>

      <Show when={isShortcutsVisible()}>
        <SShortcutsWrapper>
          <Text.Caption>
            <Shortcut
              text={isCopied() ? "Copied" : "Copy"}
              shortcutIndex={0}
              onTriggered={handleCopy}
            />
          </Text.Caption>

          <Text.Caption color={!isInsertDisabled() ? "text" : "gray"}>
            <Shortcut
              text="Insert"
              shortcutIndex={0}
              onTriggered={handleInsert}
              event="keyup"
              disabled={!focusedApplication()?.selectedText}
            />
          </Text.Caption>

          <Text.Caption color={!isReplaceDisabled() ? "text" : "gray"}>
            <Shortcut
              text="Replace"
              shortcutIndex={0}
              onTriggered={handleReplace}
              event="keyup"
              disabled={!focusedApplication()?.selectedText}
            />
          </Text.Caption>
        </SShortcutsWrapper>
      </Show>
    </>
  );
};
