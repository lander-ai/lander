import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js";
import { styled } from "solid-styled-components";
import { Link, Text } from "~/components/atoms";
import { Thread, ThreadMessage, ThreadMessageAuthor } from "~/models";
import { useUser } from "~/queries";
import { InvokeService } from "~/services";
import { NetworkService } from "~/services/network.service";
import { commandStore, mouseStore, router, View } from "~/store";
import { chatStore } from "~/store/chat.store";
import { chatCommand } from "~/util/ai-commands";
import { ChatCommand } from "./chat-command.component";
import { ChatMessage } from "./chat-message.component";

const SWrapper = styled("div")`
  height: calc(100% - 85px);
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
    -webkit-appearance: none;
  }
`;

const SLimitWrapper = styled("div")`
  margin: 16px;
`;

export const ChatView: Component = () => {
  const user = useUser();

  const { view } = router;
  const { isMouseActive } = mouseStore;
  const { selectedCommand } = commandStore;
  const {
    thread,
    setThread,
    contextualText,
    setContextualText,
    highlightedMessage,
    setHighlightedMessage,
    chatCount,
    chatLimit,
    chatCountTTL,
  } = chatStore;

  const [isAutoScroll, setIsAutoScroll] = createSignal(true);

  let wrapperRef: HTMLDivElement | undefined;

  const messages = createMemo(() => {
    const t = thread();

    if (!t?.messages) {
      return [];
    }

    const context = contextualText();

    if (context) {
      const prevMessages = [...t.messages];

      if (!prevMessages.length) {
        return prevMessages;
      }

      if (context.additionalText) {
        return [
          new ThreadMessage({
            id: "additional-text",
            author: ThreadMessageAuthor.User,
            content: context.additionalText,
          }),
          ...prevMessages.slice(1),
        ];
      }

      return t.messages.slice(1);
    }

    if (selectedCommand()?.id === chatCommand.id) {
      return [...t.messages];
    }

    return t.messages.slice(1);
  });

  const handleRetry = async () => {
    const nextThread = thread();

    if (!nextThread) {
      return;
    }

    nextThread.messages = nextThread.messages.filter(
      (message) => !message.content.includes("[LANDER_STREAM_ERROR]")
    );

    setThread(new Thread(nextThread));

    await new Promise((r) => setTimeout(r, 300));

    const request = nextThread.requests.chat;

    const responseMessage = new ThreadMessage({
      id: crypto.randomUUID(),
      author: ThreadMessageAuthor.AI,
      content: "",
    });

    nextThread.messages.push(responseMessage);

    setThread(new Thread(nextThread));

    const messageIndex = nextThread.messages.findIndex(
      (m) => m.id === responseMessage.id
    );

    await NetworkService.shared.stream(request, (content) => {
      nextThread.messages[messageIndex].content =
        responseMessage.content + content;

      setThread(new Thread(nextThread));
    });
  };

  createEffect(() => {
    if (!wrapperRef) {
      return;
    }

    const t = thread();

    if (
      t &&
      (t.messages[t.messages.length - 1]?.author === ThreadMessageAuthor.User ||
        t.messages[t.messages.length - 1]?.content === "")
    ) {
      setIsAutoScroll(true);
      wrapperRef.scrollTo({ top: wrapperRef.scrollHeight });
    }

    if (isAutoScroll() && NetworkService.isStreaming) {
      wrapperRef.scrollTo({ top: wrapperRef.scrollHeight });
    }
  });

  createEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (
        wrapperRef &&
        Math.abs(
          wrapperRef.scrollHeight -
            wrapperRef.scrollTop -
            wrapperRef.clientHeight
        ) < 24 &&
        event.deltaY > 0
      ) {
        setIsAutoScroll(true);
      } else {
        setIsAutoScroll(false);
      }
    };

    wrapperRef?.addEventListener("wheel", handleScroll);

    onCleanup(() => {
      wrapperRef?.removeEventListener("wheel", handleScroll);
    });
  });

  createEffect(() => {
    if (isMouseActive()) {
      return;
    }

    if (thread()?.messages[0]?.id === highlightedMessage()?.id) {
      wrapperRef?.scrollTo({ top: 0 });
    }

    const highlightedMessageId = highlightedMessage()?.id;

    if (highlightedMessageId) {
      const highlightedElement = document.getElementById(
        `lander__chat-${highlightedMessageId}`
      );

      const highlightedElementHeight =
        highlightedElement?.getBoundingClientRect().height;
      const highlightedElementY = highlightedElement?.getBoundingClientRect().y;

      const wrapperHeight = wrapperRef?.getBoundingClientRect().height;

      const scrollY = wrapperRef?.scrollTop;

      if (
        !wrapperRef ||
        wrapperHeight === undefined ||
        !highlightedElement ||
        highlightedElementY === undefined ||
        highlightedElementHeight === undefined ||
        scrollY === undefined
      ) {
        return;
      }

      const headerHeight = 50;

      if (
        highlightedElement.parentNode?.querySelector("[id]") ===
        highlightedElement
      ) {
        wrapperRef.scrollTo({
          top: 0,
        });
      } else {
        wrapperRef.scrollTo({
          top: highlightedElementY + scrollY - headerHeight - 24,
        });
      }
    }
  });

  const chatCountText = createMemo(() => {
    const ttl = chatCountTTL();
    const limit = chatLimit();
    const count = chatCount();

    if (Number.isNaN(limit) || Number.isNaN(count)) {
      return "You have 25 messages remaining today";
    }

    if (ttl < Date.now() / 1000) {
      return `You have ${limit} messages remaining today`;
    }

    const remainingCount = limit - count;

    if (remainingCount === 0) {
      return "You have no messages remaining today";
    }

    if (remainingCount === 1) {
      return `You have 1 message remaining today`;
    }

    return `You have ${remainingCount} messages remaining today`;
  });

  const chatCountUsageResetText = createMemo(() => {
    const ttl = chatCountTTL();

    if (!ttl) {
      return undefined;
    }

    return `Your usage resets at ${new Date(ttl * 1000).getHours()}:${new Date(
      ttl * 1000
    ).getMinutes()}`;
  });

  createEffect(() => {
    if (view() === View.Command) {
      setContextualText(undefined);
    }
  });

  return (
    <SWrapper
      ref={wrapperRef}
      onMouseLeave={() => setHighlightedMessage(undefined)}
    >
      <Show when={!user.data?.subscription}>
        <SLimitWrapper>
          <Text.Callout color="gray">{chatCountText()}</Text.Callout>

          <Show when={chatCountUsageResetText()} keyed>
            {(chatCountUsageResetText) => (
              <Text.Callout color="gray">
                {chatCountUsageResetText}
              </Text.Callout>
            )}
          </Show>

          <Link
            mt="4px"
            onClick={() => InvokeService.shared.openSettingsWindow()}
          >
            Upgrade →
          </Link>
        </SLimitWrapper>
      </Show>

      <Show when={selectedCommand()} keyed>
        {(command) => <ChatCommand command={command} />}
      </Show>

      <For each={messages()}>
        {(message) => <ChatMessage message={message} onRetry={handleRetry} />}
      </For>
    </SWrapper>
  );
};
