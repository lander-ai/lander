import { batch, onMount } from "solid-js";
import { InvokeService } from "~/services";
import {
  commandStore,
  mouseStore,
  queryStore,
  router,
  shortcutStore,
  View,
} from "~/store";
import { chatStore } from "~/store/chat.store";

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
  const { thread, setHighlightedMessage } = chatStore;

  onMount(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        setIsShortcutsVisible(true);
      } else if (event.key === "Escape") {
        const v = view();

        if (query()) {
          batch(() => {
            setHighlightedCommand(commandSections()[0].commands[0]);
            setQuery("");
          });
        } else if (v === View.Chat) {
          navigate(View.Command);
        } else {
          setHighlightedCommand(undefined);
          InvokeService.shared.hidePanel();
        }
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        const movement = event.key === "ArrowDown" ? 1 : -1;
        const up = movement === -1;
        const down = !up;

        if (view() === View.Chat) {
          if (isMouseActive()) {
            return;
          }

          setHighlightedMessage((prev) => {
            const messages = thread()?.messages;

            if (!messages) {
              return prev;
            }

            const prevIndex = messages.findIndex((r) => r.id === prev?.id);

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

        if (view() === View.Command) {
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
