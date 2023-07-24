import { Application, Command, CommandSection, CommandType } from "~/models";
import { AnalyticsService, InvokeService } from "~/services";
import { networkStore } from "~/store/network.store";
import {
  aiCommands,
  chatArchiveCommand,
  chatCommand,
  getCustomCommand,
} from "./ai-commands";
import { landerCommands } from "./lander-commands";

// TODO: Add better types
export const getCommandSection = async (
  type: CommandType,
  data?: { applications?: Application[]; focusedApplication?: Application }
) => {
  const { isOffline } = networkStore;

  if (!isOffline() && type === CommandType.AI) {
    const focusedApplication = data?.focusedApplication;

    const commands: Command[] = [];

    if (focusedApplication) {
      const customCommand = getCustomCommand(focusedApplication);

      if (customCommand) {
        commands.push(customCommand);
      }

      commands.push(chatCommand);

      if (focusedApplication.selectedText) {
        commands.push(...aiCommands);
      }

      if (!focusedApplication.selectedText) {
        const selectTextCommand = focusedApplication.toCommand(CommandType.AI);
        selectTextCommand.id = "ai-select-text";
        selectTextCommand.subtitle = "Select text for AI completions";
        selectTextCommand.suggestable = false;
        selectTextCommand.searchable = false;
        commands.push(selectTextCommand);
      }

      return new CommandSection({
        type: CommandType.AI,
        title: "AI",
        commands,
      });
    }

    return new CommandSection({
      type: CommandType.AI,
      title: "AI",
      commands: [chatCommand],
    });
  }

  if (type === CommandType.Application) {
    const applications =
      data?.applications ||
      (await InvokeService.shared.getInstalledApplications());

    return new CommandSection({
      type: CommandType.Application,
      title: "Applications",
      commands: applications.map((application) => application.toCommand()),
    });
  }
};

export const getSuggestionsCommandSection = async (commands: Command[]) => {
  const now = new Date();

  const lastMonth = new Date();
  lastMonth.setDate(now.getMonth() - 1);

  const commandEvents = await AnalyticsService.shared.aggregateCommandEvents(
    lastMonth,
    now
  );

  const suggestedCommands = commandEvents
    ?.sort((a, b) => (a.count < b.count ? 1 : -1))
    ?.map((commandEvent) => {
      const command = commands.find(
        (c) => c.id === commandEvent.event.command.id
      );

      if (command) {
        const suggestedCommand = new Command({
          ...command,
          suggestion: true,
          onClick: command.onClickMethod,
        });
        return suggestedCommand;
      }
    })
    .filter((command) => command?.suggestable)
    .slice(0, 4) as Command[] | undefined;

  if (suggestedCommands?.length) {
    return new CommandSection({
      type: CommandType.Suggestion,
      title: "Suggestions",
      commands: suggestedCommands,
    });
  }
};

export const getCommandSections = async () => {
  const commandSections: CommandSection[] = [];

  const aiCommands = await getCommandSection(CommandType.AI);

  const applicationCommands = await getCommandSection(CommandType.Application);

  const suggestedCommands = await getSuggestionsCommandSection([
    ...(aiCommands?.commands || []),
    ...(applicationCommands?.commands || []),
  ]);

  if (suggestedCommands) {
    commandSections.push(suggestedCommands);
  }

  if (aiCommands) {
    commandSections.push(aiCommands);
  }

  if (applicationCommands) {
    commandSections.push(applicationCommands);
  }

  commandSections.push(
    new CommandSection({
      type: CommandType.Lander,
      title: "Lander",
      commands: landerCommands,
    })
  );

  return commandSections;
};
