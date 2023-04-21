import { Component, For, Show } from "solid-js";
import { commandStore } from "~/store";
import { CommandOverviewFocusedApplication } from "./command-overview-focused-application.component";
import { CommandSectionTile } from "./command-section-tile.component";

export const CommandOverview: Component = () => {
  const { commandSections, focusedApplication } = commandStore;

  return (
    <>
      <Show when={focusedApplication()} keyed>
        {(focusedApplication) => (
          <Show when={focusedApplication.selectedText}>
            <CommandOverviewFocusedApplication
              focusedApplication={focusedApplication}
            />
          </Show>
        )}
      </Show>

      <For each={commandSections()}>
        {(commandSection) => (
          <CommandSectionTile commandSection={commandSection} />
        )}
      </For>
    </>
  );
};
