import { Component, createEffect, Match, Show, Switch } from "solid-js";
import { styled } from "solid-styled-components";
import { commandStore, queryStore, router, View } from "~/store";
import { CommandCalculationResult } from "./command-calculation-result.component";
import { CommandOverview } from "./command-overview.component";
import { CommandSearchView } from "./command-search-view.component";

const SWrapper = styled("div")`
  height: calc(100% - 72px);
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
    -webkit-appearance: none;
  }
`;

export const CommandView: Component = () => {
  const { view } = router;
  const { query } = queryStore;
  const {
    searchResults,
    highlightedCommand,
    setHighlightedCommand,
    calculationResult,
  } = commandStore;

  let wrapperRef: HTMLDivElement | undefined;

  let prevScrollY = 0;

  createEffect(() => {
    const highlightedCommandId = highlightedCommand()?.id;

    if (highlightedCommandId) {
      const highlightedElement = document.getElementById(
        `lander__command-${highlightedCommandId}`
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

      const footerHeight = 36;
      const headerHeight = 70;
      const scrollPadding = 12;
      const commmandTileHeight = highlightedElementHeight;
      const prevY = prevScrollY;

      prevScrollY = highlightedElementY;

      if (
        (highlightedElementY <= prevY || highlightedElementY <= headerHeight) &&
        highlightedElementY < wrapperHeight - footerHeight
      ) {
        if (
          !highlightedElement.previousSibling &&
          !highlightedElement.parentElement?.previousSibling?.previousSibling
        ) {
          wrapperRef.scrollTo({ top: 0 });
          return;
        }

        if (highlightedElementY < headerHeight + scrollPadding) {
          if (
            highlightedElement.parentNode?.firstChild === highlightedElement
          ) {
            const sectionTitleElement =
              highlightedElement.parentElement!.previousElementSibling!;

            const sectionTitleStyle = getComputedStyle(sectionTitleElement);

            const sectionTitleHeight =
              (sectionTitleElement.clientHeight || 0) +
              parseFloat(sectionTitleStyle.marginTop) +
              parseFloat(sectionTitleStyle.marginBottom);

            wrapperRef.scrollTo({
              top:
                highlightedElementY +
                scrollY -
                headerHeight -
                sectionTitleHeight +
                scrollPadding,
            });
          } else {
            wrapperRef.scrollTo({
              top: highlightedElementY + scrollY - headerHeight,
            });
          }
        }

        return;
      }

      if (highlightedElementY > wrapperHeight - footerHeight) {
        if (
          !highlightedElement.nextSibling &&
          !highlightedElement.parentElement?.nextSibling
        ) {
          wrapperRef.scrollTo({ top: Number.MAX_SAFE_INTEGER });
          return;
        }

        wrapperRef.scrollTo({
          top:
            highlightedElementY +
            scrollY -
            wrapperHeight +
            commmandTileHeight -
            scrollPadding * 2,
        });
      }
    }
  });

  createEffect(() => {
    if (view() !== View.Command) {
      setHighlightedCommand(undefined);
    }
  });

  return (
    <SWrapper ref={wrapperRef}>
      <Show when={!!query() && calculationResult() !== undefined}>
        <CommandCalculationResult
          query={query()}
          calculation={calculationResult()!}
        />
      </Show>

      <Switch fallback={<CommandOverview />}>
        <Match when={searchResults().length}>
          <CommandSearchView />
        </Match>
      </Switch>
    </SWrapper>
  );
};
