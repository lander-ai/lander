import { Component, createEffect, onCleanup, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Icon } from "~/components/atoms";
import { NetworkService } from "~/services/network.service";
import { router, View } from "~/store";
import { chatStore } from "~/store/chat.store";
import { networkStore } from "~/store/network.store";
import { askLander } from "~/util";

const SWrapper = styled("div")`
  display: grid;
  grid-template-columns: 1fr max-content;
  gap: 16px;
  padding: 8px 16px;
  align-items: center;
`;

const SChatInput = styled("div")<{ placeholder: string }>`
  font-family: ${(props) => props.theme?.fontFamily};
  font-size: 16px;
  color: ${(props) => props.theme?.colors.text};
  background: transparent;
  border: none;
  outline: none;
  word-break: break-word;
  caret-color: ${(props) => props.theme?.colors.text};
  max-height: 240px;
  overflow-y: scroll;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;

  &::-webkit-scrollbar {
    display: none;
    -webkit-appearance: none;
  }

  ::selection,
  *::selection {
    background: ${(props) => props.theme?.colors.gray};
  }

  &:empty:before {
    content: attr(placeholder);
    color: ${(props) => props.theme?.colors.gray};
    pointer-events: none;
  }
`;

const SButtonIcon = styled(Icon)`
  align-self: end;
  padding: 4px;
  border-radius: 4px;
  background: ${(props) => props.theme?.colors.gray6};
  border: ${(props) => `0.5px solid ${props.theme?.colors.gray2}`};

  &:hover {
    background: ${(props) => props.theme?.colors.gray2};
  }
`;

export const FooterChat: Component = () => {
  const { view } = router;
  const { thread, contextualText } = chatStore;
  const { isStreaming } = networkStore;

  let ref: HTMLDivElement | undefined;

  const handleSubmit = () => {
    if (!ref) {
      return;
    }

    const nextThread = thread();

    if (!nextThread) {
      return;
    }

    const context =
      nextThread.messages.length === 0 ? contextualText()?.text : undefined;

    if (!ref.innerText && !context) {
      return;
    }

    askLander(ref.innerText, nextThread);

    ref.replaceChildren();
  };

  const handleCancel = () => {
    NetworkService.subscription?.cancel();
  };

  const moveCursorToEnd = () => {
    if (ref) {
      const range = document.createRange();
      range.selectNodeContents(ref);
      range.collapse(false);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!event.shiftKey && event.key === "Enter") {
      event.preventDefault();

      handleSubmit();
    }
  };

  const handleInput = (event: InputEvent) => {
    if (!ref) {
      return;
    }

    if (
      event.inputType.includes("delete") ||
      event.inputType === "insertParagraph"
    ) {
      if (!ref.innerText.trim()) {
        ref.replaceChildren();
      }
    } else if (ref.innerText.length === 1) {
      const el = document.createElement("div");
      el.innerText = event.data || "";
      ref.replaceChildren(el);

      moveCursorToEnd();
    }
  };

  createEffect(() => {
    const onBlur = () => {
      if (view() === View.Chat) {
        ref?.focus({ preventScroll: true });
      }
    };

    const onPaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const content = event.clipboardData?.getData("text/plain");

      if (ref && content) {
        if (!ref.innerText.trim()) {
          const el = document.createElement("div");
          el.innerText = content;
          ref.replaceChildren(el);

          moveCursorToEnd();
        } else {
          document.execCommand("insertText", false, content);
        }
      }
    };

    ref?.addEventListener("blur", onBlur);
    ref?.addEventListener("paste", onPaste);

    onBlur();

    onCleanup(() => {
      ref?.removeEventListener("blur", onBlur);
    });
  });

  return (
    <SWrapper>
      <SChatInput
        placeholder={
          contextualText()
            ? `Ask from ${contextualText()?.provider}`
            : "Ask me anything"
        }
        ref={ref}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        contentEditable
      />

      <Show when={isStreaming()}>
        <SButtonIcon onClick={handleCancel} name="cross" size="18px" />
      </Show>

      <Show when={!isStreaming()}>
        <SButtonIcon onClick={handleSubmit} name="send-2" size="18px" />
      </Show>
    </SWrapper>
  );
};
