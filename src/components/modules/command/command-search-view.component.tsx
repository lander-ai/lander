import { Component, For } from "solid-js";
import { styled } from "solid-styled-components";
import { Text } from "~/components/atoms";
import { commandStore } from "~/store";
import { CommandTile } from "./command-tile.component";

const SCommandTilesWrapper = styled("div")`
  display: grid;
  padding: 0 12px;
  gap: 4px;

  &:last-child > :last-child {
    margin-bottom: 35px;
  }
`;

export const CommandSearchView: Component = () => {
  const { searchResults } = commandStore;

  return (
    <>
      <Text.Callout fontWeight="semibold" mx="12px" my="16px">
        Results
      </Text.Callout>
      <SCommandTilesWrapper>
        <For each={searchResults()}>
          {(command) => <CommandTile command={command} />}
        </For>
      </SCommandTilesWrapper>
    </>
  );
};
