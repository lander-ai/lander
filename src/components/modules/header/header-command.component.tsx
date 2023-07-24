import Fuse from "fuse.js";
import {
  batch,
  Component,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { styled } from "solid-styled-components";
import { AnalyticsEventType } from "~/models";
import { AnalyticsAggregationEvent, AnalyticsService } from "~/services";
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

let commandEvents: AnalyticsAggregationEvent<AnalyticsEventType.Command>[] = [];

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

  createEffect(() => {
    const handleOnFocus = async () => {
      if (view() === View.Command) {
        ref?.select();
      }

      const now = new Date();

      const lastMonth = new Date();
      lastMonth.setDate(now.getMonth() - 1);

      commandEvents = await AnalyticsService.shared.aggregateCommandEvents(
        lastMonth,
        now
      );
    };

    window.addEventListener("focus", handleOnFocus);

    onCleanup(() => {
      window.removeEventListener("focus", handleOnFocus);
    });
  });

  const fuse = () =>
    new Fuse(
      commandSections()
        .flatMap((command) => command.commands)
        .filter((command) => command.searchable),
      {
        keys: ["title"],
        includeScore: true,
        shouldSort: false,
        threshold: 0.4,
      }
    );

  const handleInput = async (q: string) => {
    setQuery(q);

    if (!q) {
      batch(() => {
        setSearchResults([]);
        setHighlightedCommand(commandSections()?.[0]?.commands?.[0]);
      });

      return;
    }

    const results = fuse().search(q);

    const commandEventsMaxCount =
      (
        results
          .map((result) =>
            commandEvents.find(
              (commandEvent) => commandEvent.event.command.id === result.item.id
            )
          )
          .filter(
            Boolean
          ) as AnalyticsAggregationEvent<AnalyticsEventType.Command>[]
      ).reduce((prev, next) => (next.count > prev ? next.count : prev), 0) || 0;

    const sortedResult =
      commandEventsMaxCount > 0
        ? results.sort((a, b) => {
            const aCount =
              commandEvents.find(
                (commandEvent) => commandEvent.event.command.id === a.item.id
              )?.count || 0;

            const bCount =
              commandEvents.find(
                (commandEvent) => commandEvent.event.command.id === b.item.id
              )?.count || 0;

            if (a.score === undefined || b.score === undefined) {
              return 0;
            }

            const aScore =
              (1 - a.score!) * 0.7 + (aCount / commandEventsMaxCount) * 0.3;

            const bScore =
              (1 - b.score!) * 0.7 + (bCount / commandEventsMaxCount) * 0.3;

            return aScore > bScore ? -1 : 1;
          })
        : results;

    batch(() => {
      setSearchResults(sortedResult.map((r) => r.item));
      setHighlightedCommand(sortedResult[0]?.item);
    });
  };

  createEffect(() => {
    const focus = () => {
      if (view() === View.Command) {
        setTimeout(() => {
          ref?.focus({ preventScroll: true });
        }, 300);
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
      onInput={(event) => {
        handleInput(event.currentTarget.value);
        setIsQueryDirty(true);
      }}
      ref={ref}
      readOnly={view() !== View.Command}
      disabled={view() !== View.Command}
      spellcheck={false}
    />
  );
};
