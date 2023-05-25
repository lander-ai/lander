import { Exclude, instanceToPlain } from "class-transformer";
import { Plugin } from "~/cortex";
import { NetworkRequest } from "~/services/network.service";

export enum ThreadMessageAuthor {
  User = "User",
  AI = "AI",
  System = "System",
}

export enum ThreadType {
  Completion = "Completion",
  Chat = "Chat",
}

export interface ThreadMessagePlugin extends Plugin {
  input: string;
}

export class ThreadMessage {
  id: string = crypto.randomUUID();
  author: ThreadMessageAuthor;
  content: string;

  @Exclude()
  plugins?: ThreadMessagePlugin[];

  constructor(opts: {
    id?: string;
    author: ThreadMessageAuthor;
    content: string;
  }) {
    this.id = opts.id || this.id;
    this.author = opts.author;
    this.content = opts.content;
  }
}

export class Thread {
  id: string = crypto.randomUUID();
  type: ThreadType;
  messages: ThreadMessage[];

  constructor(opts: {
    id?: string;
    type: ThreadType;
    messages: ThreadMessage[];
  }) {
    this.id = opts.id || this.id;
    this.type = opts.type;
    this.messages = opts.messages;
  }

  static requests = {
    chat(thread: Thread) {
      const dto = instanceToPlain(thread);
      return new NetworkRequest("/chat", "POST", dto.thread || dto);
    },
  };

  get requests() {
    return {
      chat: Thread.requests.chat(this),
    };
  }
}
