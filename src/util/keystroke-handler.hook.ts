import { batch, onMount } from "solid-js";
import { __macos__ } from "~/constants";
import { Thread } from "~/models";
import { InvokeService } from "~/services";
import { NetworkService } from "~/services/network.service";
import {
  commandStore,
  mouseStore,
  queryStore,
  router,
  shortcutStore,
  View,
} from "~/store";
import { chatStore } from "~/store/chat.store";
import { networkStore } from "~/store/network.store";

export const useKeystrokeHandler = () => {
  const { isMouseActive } = mouseStore;
  const { navigate, view } = router;
  const { query, setQuery } = queryStore;
  const {
    commandSections,
    highlightedCommand,
    setHighlightedCommand,
    searchResults,
  } = commandStore;
  const { setIsShortcutsVisible } = shortcutStore;
  const {
    thread,
    setThread,
    setHighlightedMessage,
    archive,
    isArchiveVisible,
    setIsArchiveVisible,
    highlightedArchiveTile,
    setHighlightedArchiveTile,
    archiveSearchResults,
    isPluginsPanelVisible,
    setIsPluginsPanelVisible,
  } = chatStore;
  const { isStreaming } = networkStore;

  onMount(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        setIsShortcutsVisible(true);
      } else if (event.key === "Escape") {
        event.preventDefault();

        const v = view();

        if (query()) {
          batch(() => {
            setHighlightedCommand(commandSections()[0].commands[0]);
            setQuery("");
          });
        } else if (v === View.Chat) {
          if (isArchiveVisible()) {
            setIsArchiveVisible(false);
          } else if (isPluginsPanelVisible()) {
            setIsPluginsPanelVisible(false);
          } else if (isStreaming()) {
            NetworkService.subscription?.cancel();
          } else {
            navigate(View.Command);
          }
        } else {
          setHighlightedCommand(undefined);
          InvokeService.shared.hidePanel();
        }
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const movement = event.key === "ArrowDown" ? 1 : -1;
        const up = movement === -1;
        const down = !up;

        if (view() === View.Chat && !isArchiveVisible()) {
          if (isMouseActive()) {
            return;
          }

          setHighlightedMessage((prev) => {
            const messages = thread()?.messages;

            if (!messages) {
              return prev;
            }

            const prevIndex = messages.findIndex(
              (message) => message.id === prev?.id
            );

            if (prevIndex === -1) {
              return messages[messages.length - 1];
            }

            if (
              (down && prevIndex < messages.length - 1) ||
              (up && prevIndex > 0)
            ) {
              return messages[prevIndex + movement];
            }

            return prev;
          });
        }

        if (view() === View.Chat && isArchiveVisible()) {
          setHighlightedArchiveTile((prev) => {
            const searchResults = archiveSearchResults();

            const prevId = prev instanceof Thread ? prev.id : prev?.message.id;

            if (searchResults) {
              if (!searchResults) {
                return prev;
              }

              const prevIndex = searchResults.findIndex(
                (result) => result.message.id === prevId
              );

              if (prevIndex === -1) {
                return searchResults[0];
              }

              if (
                (down && prevIndex < searchResults.length - 1) ||
                (up && prevIndex > 0)
              ) {
                return searchResults[prevIndex + movement];
              }
            } else {
              const threads = archive();

              const prevIndex = threads.findIndex(
                (result) => result.id === prevId
              );

              if (prevIndex === -1) {
                return threads[0];
              }

              if (
                (down && prevIndex < threads.length - 1) ||
                (up && prevIndex > 0)
              ) {
                return threads[prevIndex + movement];
              }
            }

            return prev;
          });
        }

        if (view() === View.Command) {
          event.preventDefault();

          setHighlightedCommand((prev) => {
            const commands = query()
              ? searchResults()
              : commandSections().flatMap((c) => c.commands);

            const prevIndex = commands.findIndex((r) => r.id === prev?.id);

            if (prevIndex === -1) {
              return commands[0];
            }

            if (
              (down && prevIndex < commands.length - 1) ||
              (up && prevIndex > 0)
            ) {
              return commands[prevIndex + movement];
            }

            return prev;
          });
        }
      } else if (event.key === "Enter") {
        if (view() === View.Chat && isArchiveVisible()) {
          const result = highlightedArchiveTile();

          if (!result) {
            return;
          }

          if (result instanceof Thread) {
            setThread(result);
          } else {
            setThread(result.thread);
            setHighlightedMessage(result.message);
          }

          batch(() => {
            setIsArchiveVisible(false);
            setHighlightedArchiveTile(undefined);
          });
        }

        if (view() === View.Command) {
          highlightedCommand()?.onClick();

          setTimeout(() => {
            setQuery("");
          }, 400);
        }
      }
    };

    window.addEventListener("keydown", handler);
  });

  onMount(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        setIsShortcutsVisible(false);
      }
    };

    window.addEventListener("keyup", handler);
  });
  return null;
};
