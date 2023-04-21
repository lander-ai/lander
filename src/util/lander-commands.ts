import icon from "~/assets/icon.png";
import { Command, CommandType } from "~/models";
import { InvokeService } from "~/services";

export const landerCommands = [
  new Command({
    type: CommandType.Lander,
    title: "Settings",
    subtitle: "Manage Lander",
    icon,
    id: "lander-settings",
    onClick() {
      InvokeService.shared.openSettingsWindow();
    },
  }),
];
