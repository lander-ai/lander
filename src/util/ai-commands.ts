import { batch } from "solid-js";
import icon from "~/assets/icon.png";
import {
  Application,
  Command,
  CommandType,
  Thread,
  ThreadMessage,
  ThreadMessageAuthor,
  ThreadType,
} from "~/models";
import { NetworkService } from "~/services/network.service";
import { commandStore, router, View } from "~/store";
import { chatStore } from "~/store/chat.store";

const startChat = async (command: Command, prompt: string) => {
  const { navigate, view } = router;
  const { setThread } = chatStore;
  const { focusedApplication, setSelectedCommand } = commandStore;

  command.application = focusedApplication();

  const selectedText = command.application?.selectedText;

  const responseMessage = new ThreadMessage({
    id: crypto.randomUUID(),
    author: ThreadMessageAuthor.AI,
    content: "",
  });

  const thread = new Thread({
    id: crypto.randomUUID(),
    type: ThreadType.Chat,
    messages: [
      new ThreadMessage({
        id: crypto.randomUUID(),
        author: ThreadMessageAuthor.User,
        content: `${prompt}${selectedText}`,
      }),
    ],
  });

  const request = thread.requests.chat;

  thread.messages.push(responseMessage);

  setThread(new Thread(thread));

  batch(() => {
    setSelectedCommand(command);
    navigate(View.Chat);
  });

  const messageIndex = thread.messages.findIndex(
    (message) => message.id === responseMessage.id
  );

  const subscription = await NetworkService.shared.stream(
    request,
    (content) => {
      if (view() !== View.Chat) {
        subscription.cancel();
        return;
      }

      thread.messages[messageIndex].content = responseMessage.content + content;

      setThread(new Thread(thread));
    }
  );
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
      startChat(new Command(this), prompt);
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
      startChat(new Command(this), prompt);
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
