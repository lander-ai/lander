import { ThreadMessage, ThreadMessageAuthor } from "~/models";

interface MessageType {
  content: string;
}

export class BaseMessage implements MessageType {
  content: string;

  constructor(content: string) {
    this.content = content;
  }
}

export class UserMessage extends BaseMessage {}

export class AIMessage extends BaseMessage {}

export class SystemMessage extends BaseMessage {}

export type Message = UserMessage | AIMessage | SystemMessage;

export class Messages extends Array<Message> {
  add(messages: Message[]): void;

  add(message: Message): void;

  add(message: ThreadMessage): void;

  add(messages: ThreadMessage[]): void;

  add(messages: Message | Message[] | ThreadMessage | ThreadMessage[]) {
    if (Array.isArray(messages)) {
      messages.forEach((message) => {
        this.add(message);
      });
    } else {
      if (messages instanceof ThreadMessage) {
        const message =
          messages.author === ThreadMessageAuthor.System
            ? new SystemMessage(messages.content)
            : messages.author === ThreadMessageAuthor.AI
            ? new AIMessage(messages.content)
            : new UserMessage(messages.content);

        this.push(message);
      } else {
        this.push(messages);
      }
    }
  }

  clear() {
    this.splice(0, this.length);
  }

  get threadMessages() {
    return this.map(
      (message) =>
        new ThreadMessage({
          author:
            message instanceof SystemMessage
              ? ThreadMessageAuthor.System
              : message instanceof AIMessage
              ? ThreadMessageAuthor.AI
              : ThreadMessageAuthor.User,
          content: message.content,
        })
    );
  }
}
