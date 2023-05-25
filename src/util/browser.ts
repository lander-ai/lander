import { CommandType } from "~/models";
import { BrowserDriver } from "~/services";
import { commandStore } from "~/store";

export const getBrowserDrivers = () => {
  const { commandSections } = commandStore;

  const applicationCommands = commandSections().find(
    (commandSection) => commandSection.type === CommandType.Application
  )?.commands;

  if (!applicationCommands) {
    return undefined;
  }

  const browserApplications = applicationCommands.filter(
    (command) =>
      command.id === "com.google.Chrome" || command.id === "org.mozilla.firefox"
  );

  const browsers = browserApplications
    .map((application) => {
      if (application.id === "com.google.Chrome") {
        return BrowserDriver.Chrome;
      }

      if (application.id === "org.mozilla.firefox") {
        return BrowserDriver.Firefox;
      }
    })
    .sort((a) => {
      if (a === BrowserDriver.Chrome) {
        return -1;
      }

      return 0;
    });

  if (!browsers.length) {
    return undefined;
  }

  return browsers;
};
