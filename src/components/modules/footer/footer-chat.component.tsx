import { batch, Component, createEffect, onCleanup } from "solid-js";
import { styled } from "solid-styled-components";
import { Icon } from "~/components/atoms";
import { Thread, ThreadMessage, ThreadMessageAuthor } from "~/models";
import { NetworkService } from "~/services/network.service";
import { router, View } from "~/store";
import { chatStore } from "~/store/chat.store";

const SWrapper = styled("div")`
  display: grid;
  grid-template-columns: 1fr max-content;
  gap: 16px;
  padding: 8px 16px;
  align-items: center;

  &::selection {
    background: ${(props) => props.theme?.colors.gray};
  }
`;

const SChatInput = styled("div")<{ placeholder: string }>`
  font-family: ${(props) => props.theme?.fontFamily};
  font-size: 16px;
  color: ${(props) => props.theme?.colors.text};
  background: transparent;
  border: none;
  outline: none;
  cursor: text;
  word-break: break-word;
  caret-color: ${(props) => props.theme?.colors.text};
  max-height: 240px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
    -webkit-appearance: none;
  }

  &::selection {
    background: ${(props) => props.theme?.colors.gray};
  }

  &:empty:before {
    content: attr(placeholder);
    color: ${(props) => props.theme?.colors.gray};
    pointer-events: none;
  }
`;

const SSendIcon = styled(Icon)`
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
  const {
    thread,
    setThread,
    contextualText,
    setContextualText,
    setHighlightedMessage,
  } = chatStore;

  let ref: HTMLDivElement | undefined;

  const handleChat = async (input: string) => {
    const nextThread = thread();

    if (!ref || !nextThread) {
      return;
    }

    const context = !nextThread?.messages.length
      ? contextualText()?.text
      : undefined;

    const message =
      context && input ? `${context}\n\n${input}` : context || input;

    nextThread.messages.push(
      new ThreadMessage({
        id: crypto.randomUUID(),
        author: ThreadMessageAuthor.User,
        content: message,
      })
    );

    const request = nextThread.requests.chat;

    const responseMessage = new ThreadMessage({
      id: crypto.randomUUID(),
      author: ThreadMessageAuthor.AI,
      content: "",
    });

    nextThread.messages.push(responseMessage);

    batch(() => {
      setHighlightedMessage(undefined);
      setContextualText((prev) =>
        prev ? { ...prev, additionalText: input } : undefined
      );
      setThread(new Thread(nextThread));
    });

    const messageIndex = nextThread.messages.findIndex(
      (m) => m.id === responseMessage.id
    );

    await NetworkService.shared.stream(request, (content) => {
      nextThread.messages[messageIndex].content =
        responseMessage.content + content;

      setThread(new Thread(nextThread));
    });
  };

  const handleSubmit = () => {
    const context =
      thread()?.messages.length === 0 ? contextualText()?.text : undefined;

    if (NetworkService.isStreaming || !ref || (!ref.innerText && !context)) {
      return;
    }

    handleChat(ref.innerText);

    if (ref) {
      ref.innerText = "";
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!event.shiftKey && event.key === "Enter") {
      event.preventDefault();

      handleSubmit();
    }
  };

  const handleInput = () => {
    if (ref && !ref?.innerText.trim()) {
      ref.innerText = "";
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

      if (content) {
        document.execCommand("insertText", false, content);
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

      <SSendIcon onClick={handleSubmit} name="send-2" size="18px" />
    </SWrapper>
  );
};
