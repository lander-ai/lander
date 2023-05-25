import { batch } from "solid-js";
import icon from "~/assets/icon.png";
import {
  Application,
  Command,
  CommandType,
  Thread,
  ThreadType,
} from "~/models";
import { commandStore, router, View } from "~/store";
import { chatStore } from "~/store/chat.store";
import { askLander } from "./ask-lander";

const handleChat = async (command: Command, prompt: string) => {
  const { navigate } = router;
  const { focusedApplication, setSelectedCommand } = commandStore;

  command.application = focusedApplication();

  const selectedText = command.application?.selectedText;

  const thread = new Thread({
    id: crypto.randomUUID(),
    type: ThreadType.Chat,
    messages: [],
  });

  askLander(`${prompt}${selectedText}`, thread);

  batch(() => {
    setSelectedCommand(command);
    navigate(View.Chat);
  });
};

const getCommand = (title: string, prompt: string) => {
  return new Command({
    get id() {
      return `ai-${this.title.toLowerCase().replace(" ", "-")}`;
    },
    type: CommandType.AI,
    title,
    icon,
    async onClick() {
      handleChat(new Command(this), prompt);
    },
  });
};

export const chatCommand = new Command({
  id: "ai-chat",
  type: CommandType.AI,
  title: "Chat with AI",
  icon,
  onClick() {
    const { navigate } = router;
    const { setThread } = chatStore;
    const { setSelectedCommand } = commandStore;

    const thread = new Thread({
      id: crypto.randomUUID(),
      type: ThreadType.Chat,
      messages: [],
    });

    batch(() => {
      setSelectedCommand(new Command(this));
      setThread(new Thread(thread));
      navigate(View.Chat);
    });
  },
});

export const getCustomCommand = (focusedApplication: Application) => {
  const prompt = focusedApplication.focusedText?.match(/\/lander(.*)/)?.[1];

  if (!prompt) {
    return undefined;
  }

  return new Command({
    id: "ai-custom-command",
    type: CommandType.AI,
    title: "Custom command",
    subtitle: prompt,
    icon,
    async onClick() {
      handleChat(new Command(this), prompt);
    },
  });
};

export const aiCommands = [
  getCommand("Summarize selected text", "Summarize:\n\n"),
  getCommand("Generate a bullet point summary", "Bullet point:\n\n"),
  getCommand("Improve writing & fix grammar", "Improve writing:\n\n"),
  getCommand("Make content more readable", "Make readable:\n\n"),
  getCommand("Make content more academic", "Make academic:\n\n"),
  getCommand("Extract key quotes from content", "Extract key quotes:\n\n"),
  getCommand("Extract key data from content", "Extract key data:\n\n"),
  getCommand("Generate questions from content", "Generate questions:\n\n"),
  getCommand(
    "Generate social media caption",
    "Generate social media caption:\n\n"
  ),
  getCommand("Improve content for SEO", "Improve for SEO:\n\n"),
  getCommand("Change tone to friendly", "Change tone to friendly:\n\n"),
  getCommand("Change tone to professional", "Change tone to professional:\n\n"),
  getCommand("Change tone to sarcastic", "Change tone to sarcastic:\n\n"),
  getCommand("Change tone to humorous", "Change tone to humorous:\n\n"),
];
