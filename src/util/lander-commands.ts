import { batch } from "solid-js";
import icon from "~/assets/icon.png";
import { Command, CommandType } from "~/models";
import { InvokeService } from "~/services";
import { router, View } from "~/store";
import { chatStore } from "~/store/chat.store";

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
  new Command({
    id: "chat-archive",
    type: CommandType.AI,
    title: "Chat archive",
    subtitle: "See previous conversations",
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
];
