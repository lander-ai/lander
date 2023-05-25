import { instanceToPlain } from "class-transformer";
import { batch } from "solid-js";
import { OpenAIChatModel, Plugin } from "~/cortex";
import {
  Thread,
  ThreadMessage,
  ThreadMessageAuthor,
  ThreadMessagePlugin,
} from "~/models";
import { NetworkService } from "~/services/network.service";
import { chatStore } from "~/store/chat.store";

export const retryLander = async (thread: Thread) => {
  askLander(undefined, thread);
};

export const askLander = async (input: string | undefined, thread: Thread) => {
  const {
    setThread,
    contextualText,
    setContextualText,
    setHighlightedMessage,
    selectedPlugins,
  } = chatStore;

  if (NetworkService.isStreaming) {
    return;
  }

  const context = !thread?.messages.length ? contextualText()?.text : undefined;

  const message =
    context && input ? `${context}\n\n${input}` : context || input;

  if (message) {
    thread.messages.push(
      new ThreadMessage({
        id: crypto.randomUUID(),
        author: ThreadMessageAuthor.User,
        content: message,
      })
    );
  }

  const responseMessage = new ThreadMessage({
    id: crypto.randomUUID(),
    author: ThreadMessageAuthor.AI,
    content: "",
  });

  thread.messages.push(responseMessage);

  batch(() => {
    setHighlightedMessage(undefined);
    setContextualText((prev) =>
      prev ? { ...prev, additionalText: input } : undefined
    );
    setThread(new Thread(thread));
  });

  const messageIndex = thread.messages.findIndex(
    (m) => m.id === responseMessage.id
  );

  const chat = new OpenAIChatModel();

  chat.memory.messages.add(
    thread.messages.slice(0, thread.messages.length - 2)
  );

  chat.plugins = selectedPlugins();

  const messagePlugins = new Array<ThreadMessagePlugin>();

  chat.on("response", (data) => {
    thread.messages[messageIndex].content = `${responseMessage.content}${data}`;
    setThread(new Thread(thread));
  });

  chat.on("plugin", (plugin, input) => {
    messagePlugins.push({
      ...(instanceToPlain(plugin) as Plugin),
      input,
    });
    thread.messages[messageIndex].plugins = [...messagePlugins];
    setThread(new Thread(thread));
  });

  chat.call(message || thread.messages[thread.messages.length - 2].content);
};
