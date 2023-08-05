import { Exclude, Expose, instanceToPlain } from "class-transformer";
import { Plugin } from "~/cortex";
import { NetworkRequest } from "~/services/network.service";
import { Command } from "./command.model";

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

  @Expose({ name: "created_at", groups: ["local"] })
  createdAt = new Date();

  @Expose({ name: "updated_at", groups: ["local"] })
  updatedAt = new Date();

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

  @Expose({ groups: ["local"] })
  command?: Command;

  @Expose({ name: "created_at", groups: ["local"] })
  createdAt = new Date();

  @Expose({ name: "updated_at", groups: ["local"] })
  updatedAt = new Date();

  constructor(opts: {
    id?: string;
    type: ThreadType;
    messages: ThreadMessage[];
    command?: Command;
  }) {
    this.id = opts.id || this.id;
    this.type = opts.type;
    this.messages = opts.messages;
    this.command = opts.command;
  }

  static requests = {
    chat(thread: Thread) {
      const dto = instanceToPlain(thread, { groups: ["stream"] });
      return new NetworkRequest("/chat", "POST", dto.thread || dto);
    },
  };

  get requests() {
    return {
      chat: Thread.requests.chat(this),
    };
  }
}
