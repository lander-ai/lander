import { exit } from "@tauri-apps/api/process";
import { batch } from "solid-js";
import icon from "~/assets/icon.png";
import { prompt } from "~/components";
import { Command, CommandType } from "~/models";
import { InvokeService } from "~/services";
import { router, View } from "~/store";
import { chatStore } from "~/store/chat.store";

export const landerCommands = [
  new Command({
    type: CommandType.Lander,
    title: "Settings",
    subtitle: "Manage Lander",
    suggestable: false,
    icon,
    id: "lander-settings",
    onClick() {
      InvokeService.shared.openSettingsWindow();
    },
  }),
  new Command({
    id: "chat-archive",
    type: CommandType.Lander,
    title: "Chat archive",
    subtitle: "See previous conversations",
    suggestable: false,
    icon,
    onClick() {
      const { navigate } = router;
      const { setIsArchiveVisible } = chatStore;

      batch(() => {
        setIsArchiveVisible(true);
        navigate(View.Chat);
      });
    },
  }),
  new Command({
    id: "lander-close",
    type: CommandType.Lander,
    title: "Close Lander",
    icon,
    suggestable: false,
    onClick() {
      prompt({
        title: "Close Lander",
        body: "Are you sure you want to close Lander?",
        successText: "Close",
        onSuccess() {
          exit();
        },
      });
    },
  }),
];
