import Fuse from "fuse.js";
import {
  batch,
  Component,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { styled } from "solid-styled-components";
import { commandStore, queryStore, router, View } from "~/store";

const SSearchInput = styled("input")`
  font-family: ${(props) => props.theme?.fontFamily};
  font-size: 18px;
  color: ${(props) => props.theme?.colors.text};
  width: 100%;
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: ${(props) => props.theme?.colors.gray};
  }

  &::selection {
    background: ${(props) => props.theme?.colors.gray};
  }
`;

export const HeaderCommand: Component = () => {
  const { view } = router;
  const { query, setQuery, setQueryRef } = queryStore;
  const { commandSections, setSearchResults, setHighlightedCommand } =
    commandStore;

  const [isQueryDirty, setIsQueryDirty] = createSignal(false);

  let ref: HTMLInputElement | undefined;

  createEffect(() => {
    setQueryRef(ref);
  });

  const fuse = () =>
    new Fuse(
      commandSections()
        .flatMap((command) => command.commands)
        .filter((command) => command.searchable),
      { keys: ["title"] }
    );

  const handleInput = (q: string) => {
    setQuery(q);

    if (!q) {
      batch(() => {
        setSearchResults([]);
        setHighlightedCommand(commandSections()?.[0]?.commands?.[0]);
      });

      return;
    }

    const result = fuse().search(q);
    batch(() => {
      setSearchResults(result.map((r) => r.item));
      setHighlightedCommand(result[0]?.item);
    });
  };

  createEffect(() => {
    const focus = () => {
      if (view() === View.Command) {
        ref?.focus({ preventScroll: true });
      }
    };

    focus();

    ref?.addEventListener("blur", focus);

    onCleanup(() => {
      ref?.removeEventListener("blur", focus);
    });
  });

  createEffect(() => {
    if (query() === "") {
      if (ref) {
        ref.value = "";
      }

      if (isQueryDirty()) {
        handleInput("");
      }
    }
  });

  return (
    <SSearchInput
      placeholder="Ask me anything"
      onInput={(e) =>
        setIsQueryDirty(true) && handleInput(e.currentTarget.value)
      }
      ref={ref}
      readOnly={view() !== View.Command}
      disabled={view() !== View.Command}
    />
  );
};
