import Fuse from "fuse.js";
import { batch, Component, createEffect, on, onCleanup, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Button, Icon } from "~/components/atoms";
import { useArchive, useUser } from "~/queries";
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
  min-height: 27px;
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

const SChatButtonsWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 12px;
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

const drafts: { chat: string | undefined } = {
  chat: undefined,
};

export const FooterChat: Component = () => {
  const { view } = router;
  const {
    thread,
    contextualText,
    isArchiveVisible,
    setArchiveSearchResults,
    setHighlightedArchiveTile,
    setIsPluginsPanelVisible,
    selectedPlugins,
    setHighlightedMessage,
  } = chatStore;
  const { isStreaming } = networkStore;

  const user = useUser();

  const archive = useArchive();

  createEffect(() => {
    if (isArchiveVisible()) {
      archive.refetch();
    }
  });

  const handleTogglePlugins = () => {
    if (view() === View.Chat) {
      setIsPluginsPanelVisible((prev) => !prev);
    }
  };

  const fuse = () =>
    new Fuse(
      archive.data?.flatMap((thread) =>
        thread.messages.map((message) => ({ message, thread }))
      ) || [],
      {
        keys: ["message.content"],
        threshold: 0.2,
        ignoreLocation: true,
      }
    );

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
    if (isArchiveVisible() && event.key === "Enter") {
      event.preventDefault();
    }

    if (!isArchiveVisible() && !event.shiftKey && event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  createEffect(() => {
    if (!ref) {
      return;
    }

    if (isArchiveVisible()) {
      drafts.chat = ref?.innerText;
    }

    let next: string | undefined;

    if (!isArchiveVisible() && drafts.chat) {
      next = drafts.chat;
    }

    if (next) {
      const el = document.createElement("div");
      el.innerText = next;
      ref.replaceChildren(el);
    } else {
      setArchiveSearchResults(undefined);
      ref.replaceChildren();
    }
  });

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

    if (isArchiveVisible()) {
      setHighlightedMessage(undefined);

      const query = ref.innerText.trim() ?? "";

      if (!query) {
        setArchiveSearchResults(undefined);
        return;
      }

      const results = fuse().search(ref.innerText.trim() ?? "");

      batch(() => {
        setArchiveSearchResults(results.map((result) => result.item));
        setHighlightedArchiveTile(results[0]?.item);
      });
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
          isArchiveVisible()
            ? "Search archive"
            : contextualText()
            ? `Ask from ${contextualText()?.provider}`
            : "Ask me anything"
        }
        ref={ref}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        contentEditable
      />

      <Show when={!isArchiveVisible()}>
        <SChatButtonsWrapper>
          <Show when={user.data?.subscription || true}>
            <Button
              py="2px"
              onClick={handleTogglePlugins}
              shortcutIndex={0}
              selected={!!selectedPlugins().size}
            >
              Plugins
            </Button>
          </Show>

          <Show when={isStreaming()}>
            <SButtonIcon onClick={handleCancel} name="cross" size="18px" />
          </Show>

          <Show when={!isStreaming()}>
            <SButtonIcon onClick={handleSubmit} name="send-2" size="18px" />
          </Show>
        </SChatButtonsWrapper>
      </Show>
    </SWrapper>
  );
};
