import { Component, createEffect, Match, Switch } from "solid-js";
import { styled } from "solid-styled-components";
import { commandStore, router, View } from "~/store";
import { CommandOverview } from "./command-overview.component";
import { CommandSearchView } from "./command-search-view.component";

const SWrapper = styled("div")`
  height: calc(100% - 56px);
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
    -webkit-appearance: none;
  }
`;

export const CommandView: Component = () => {
  const { view } = router;
  const { searchResults, highlightedCommand, setHighlightedCommand } =
    commandStore;

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
      const searchHeight = 50;
      const scrollPadding = 12;
      const commmandTileHeight = highlightedElementHeight;
      const prevY = prevScrollY;

      prevScrollY = highlightedElementY;

      if (
        (highlightedElementY <= prevY || highlightedElementY <= searchHeight) &&
        highlightedElementY < wrapperHeight - footerHeight
      ) {
        if (highlightedElementY < searchHeight + scrollPadding) {
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
                searchHeight -
                sectionTitleHeight +
                scrollPadding,
            });
          } else {
            wrapperRef.scrollTo({
              top: highlightedElementY + scrollY - searchHeight,
            });
          }
        }

        return;
      }

      if (highlightedElementY > wrapperHeight - footerHeight) {
        wrapperRef.scrollTo({
          top:
            highlightedElementY +
            scrollY -
            wrapperHeight +
            commmandTileHeight / 2 +
            scrollPadding,
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
      <Switch fallback={<CommandOverview />}>
        <Match when={searchResults().length}>
          <CommandSearchView />
        </Match>
      </Switch>
    </SWrapper>
  );
};