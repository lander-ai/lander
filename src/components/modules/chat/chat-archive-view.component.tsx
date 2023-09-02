import { Component, createEffect, For, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Button, Text } from "~/components/atoms";
import { Thread, ThreadMessage } from "~/models";
import { useArchive } from "~/queries";
import { ThreadService } from "~/services/thread.service";
import { mouseStore } from "~/store";
import { chatStore } from "~/store/chat.store";
import { startNewChat } from "~/util";
import { ChatArchiveSearchTile } from "./chat-archive-search-tile.component";
import { ChatArchiveThreadTile } from "./chat-archive-thread-tile.component";

const SWrapper = styled("div")`
  height: calc(100% - 128px);
  overflow-y: scroll;
  padding: 12px;
  display: grid;
  align-content: start;
  gap: 12px;

  &::-webkit-scrollbar {
    display: none;
    -webkit-appearance: none;
  }
`;

const SFallbackWrapper = styled("div")`
  margin-left: 4px;
  margin-top: 4px;
`;

export const ChatArchiveView: Component = () => {
  const {
    setIsArchiveVisible,
    archiveSearchResults,
    setThread,
    setHighlightedMessage,
    highlightedArchiveTile,
    setArchive,
  } = chatStore;
  const { isMouseActive } = mouseStore;

  let wrapperRef: HTMLDivElement | undefined;

  const archive = useArchive();

  createEffect(() => {
    setArchive(archive.data || []);
  });

  const handleOpenThread = (thread: Thread, message?: ThreadMessage) => {
    if (message) {
      setHighlightedMessage(message);
    }

    setThread(thread);
    setIsArchiveVisible(false);
  };

  const handleDeleteThread = async (thread: Thread) => {
    await ThreadService.shared.remove(thread.id);
    await archive.refetch();
  };

  let prevScrollY = 0;

  createEffect(() => {
    if (isMouseActive()) {
      return;
    }

    const highlightedTile = highlightedArchiveTile();

    const highlightedTileId =
      highlightedTile instanceof Thread
        ? highlightedTile.id
        : highlightedTile?.message.id;

    if (highlightedTileId) {
      const highlightedElement = document.getElementById(
        `lander__archive-${highlightedTileId}`
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

      const footerHeight = 43;
      const headerHeight = 70;
      const scrollPadding = 46;
      const tileHeight = highlightedElementHeight;
      const prevY = prevScrollY;

      prevScrollY = highlightedElementY;

      if (
        (highlightedElementY <= prevY || highlightedElementY <= headerHeight) &&
        highlightedElementY < wrapperHeight - footerHeight
      ) {
        if (!highlightedElement.parentElement?.previousSibling) {
          wrapperRef.scrollTo({ top: 0 });
          return;
        }

        if (highlightedElementY < headerHeight) {
          wrapperRef.scrollTo({
            top: highlightedElementY + scrollY - headerHeight,
          });
        }

        return;
      }

      if (highlightedElementY > wrapperHeight - footerHeight) {
        if (!highlightedElement.parentElement?.nextSibling) {
          wrapperRef.scrollTo({ top: Number.MAX_SAFE_INTEGER });
          return;
        }

        wrapperRef.scrollTo({
          top:
            highlightedElementY +
            scrollY -
            wrapperHeight +
            tileHeight -
            scrollPadding,
        });
      }
    }
  });

  return (
    <SWrapper ref={wrapperRef}>
      <Show when={!archive.data?.length}>
        <SFallbackWrapper>
          <Text.Callout fontWeight="medium" color="gray">
            You have no archived chats
          </Text.Callout>
          <Button mt="12px" onClick={() => startNewChat()} shortcutIndex={0}>
            New chat
          </Button>
        </SFallbackWrapper>
      </Show>

      <Show when={archive.data?.length}>
        <Show when={!archiveSearchResults()}>
          <For each={archive.data}>
            {(thread) => (
              <ChatArchiveThreadTile
                onDelete={handleDeleteThread}
                onClick={handleOpenThread}
                thread={thread}
              />
            )}
          </For>
        </Show>

        <Show when={archiveSearchResults()} keyed>
          {(archivedSearchResults) => (
            <Show
              when={archivedSearchResults.length}
              fallback={
                <SFallbackWrapper>
                  <Text.Callout color="gray" fontWeight="medium">
                    No results found {":("}
                  </Text.Callout>
                </SFallbackWrapper>
              }
            >
              <For each={archivedSearchResults}>
                {({ message, thread }) => (
                  <ChatArchiveSearchTile
                    onClick={handleOpenThread}
                    thread={thread}
                    message={message}
                  />
                )}
              </For>
            </Show>
          )}
        </Show>
      </Show>
    </SWrapper>
  );
};
