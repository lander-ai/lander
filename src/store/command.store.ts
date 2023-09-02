import { createRoot, createSignal } from "solid-js";
import { CalculatorResult } from "~/calculator/types";
import { Application, Command, CommandSection, CommandType } from "~/models";

export const commandStore = createRoot(() => {
  const [commandSections, mutateCommandSections] = createSignal<
    CommandSection[]
  >([]);
  const [searchResults, setSearchResults] = createSignal<
    Command[] | undefined
  >();
  const [focusedApplication, setFocusedApplication] =
    createSignal<Application>();
  const [highlightedCommand, setHighlightedCommand] = createSignal<Command>();
  const [selectedCommand, setSelectedCommand] = createSignal<Command>();
  const [calculationResult, setCalculationResult] =
    createSignal<CalculatorResult>();

  const setCommandSections = (next: CommandSection[]) => {
    mutateCommandSections(next);
  };

  const setCommandSection = (
    type: CommandType,
    next: CommandSection | undefined,
    index?: number
  ) => {
    let prev = commandSections();

    if (prev === undefined) {
      return;
    }

    const sectionIndex = prev.findIndex((c) => c.type === type);

    if (!next) {
      prev = prev.filter((_, index) => index !== sectionIndex);
    } else if (sectionIndex === -1 && index === undefined) {
      prev.unshift(next);
    } else {
      if (index !== undefined) {
        prev = prev.filter((commandSection) => commandSection.type !== type);
        prev.splice(index, 0, next);
      } else {
        prev[sectionIndex] = next;
      }
    }

    mutateCommandSections([...prev]);
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
    calculationResult,
    setCalculationResult,
  };
});
