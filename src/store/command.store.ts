import { createRoot, createSignal } from "solid-js";
import { Application, Command, CommandSection, CommandType } from "~/models";

export const commandStore = createRoot(() => {
  const [commandSections, mutateCommandSections] = createSignal<
    CommandSection[]
  >([]);
  const [searchResults, setSearchResults] = createSignal<Command[]>([]);
  const [focusedApplication, setFocusedApplication] =
    createSignal<Application>();
  const [highlightedCommand, setHighlightedCommand] = createSignal<Command>();
  const [selectedCommand, setSelectedCommand] = createSignal<Command>();

  const setCommandSections = (next: CommandSection[]) => {
    mutateCommandSections(next);
  };

  const setCommandSection = (
    type: CommandType,
    next: CommandSection | undefined
  ) => {
    let prev = commandSections();

    const sectionIndex = prev?.findIndex((c) => c.type === type);

    if (sectionIndex !== undefined) {
      if (!next) {
        prev = prev.filter((_, index) => index !== sectionIndex);
      } else if (sectionIndex === -1) {
        prev.unshift(next);
      } else {
        prev[sectionIndex] = next;
      }

      mutateCommandSections([...prev]);
    }
  };

  return {
    commandSections,
    setCommandSections,
    setCommandSection,
    searchResults,
    setSearchResults,
    focusedApplication,
    setFocusedApplication,
    highlightedCommand,
    setHighlightedCommand,
    selectedCommand,
    setSelectedCommand,
  };
});
