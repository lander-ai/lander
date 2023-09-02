import { Component, Show } from "solid-js";
import { CommandSection, CommandType } from "~/models";
import { commandStore, queryStore } from "~/store";
import { getSystemSearchCommands } from "~/util/system-search-commands";
import { CommandSectionTile } from "./command-section-tile.component";

export const CommandSearchView: Component = () => {
  const { searchResults } = commandStore;
  const { query } = queryStore;

  return (
    <>
      <Show when={searchResults()?.length}>
        <CommandSectionTile
          commandSection={
            new CommandSection({
              title: "Results",
              type: CommandType.Search,
              commands: searchResults()!,
            })
          }
        />
      </Show>
      <CommandSectionTile
        commandSection={
          new CommandSection({
            title: "Search",
            type: CommandType.Search,
            commands: getSystemSearchCommands(query()),
          })
        }
      />
    </>
  );
};
