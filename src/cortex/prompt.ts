import { instanceToPlain } from "class-transformer";
import { Memory } from "./memory";
import { Messages, SystemMessage, UserMessage } from "./message";
import { Plugins } from "./plugin";

export interface PluginPromptResponse {
  plugin: string;
  input: string;
}

export interface FinalPromptResponse {
  response: string;
}

const DEFAULT_SYSTEM_MESSAGE =
  "Lander is a large language model trained to assist with a wide range of tasks.";

const PLUGIN_SYSTEM_MESSAGE = () => `
Lander is a large language model trained to assist with a wide range of tasks.

Lander has the ability to use plugins to grab information from external data sources.

The current datetime is ${(() => new Date().toISOString())()}
`;

const PLUGIN_USER_MESSAGE = (plugins: Plugins) => `
PLUGINS
----
You can **optionally** use a plugin if you need to get data from an external source.

You have access to the following plugins:
${Array.from(plugins).map(
  (plugin) => `

name: ${plugin.name}
description: ${plugin.modelDescription}
`
)}

RESPONSE FORMAT INSTRUCTIONS
----
When you respond, you must output a response in JSON using one of two formats:

Option 1 (if you want to output the final answer):
{ 
  "response": string // output your final answer as a string formatted with markdown, you should explain your data from any plugins used
}

Option 2 (if you want to use a plugin):
{
    "plugin": string // the action to take. Must be one of ${Array.from(plugins)
      .map((plugin) => plugin.name)
      .join(" ")}
    "input": string // the input to the action
}

You can use multiple plugins to reach your final answer (option 1).
`;

export class Prompt {
  private plugins?: Plugins;
  private memory: Memory;

  constructor({
    input,
    plugins,
    memory,
  }: {
    input: string;
    plugins?: Plugins;
    memory?: Memory;
  }) {
    this.plugins = plugins;
    this.memory = memory || new Memory();

    if (this.plugins?.size) {
      this.memory.messages.add(
        new UserMessage(
          `Query: ${input}\n\nRemember to reply using the RESPONSE FORMAT INSTRUCTIONS.\nJSON response:`
        )
      );
    } else {
      this.memory.messages.add(new UserMessage(input));
    }
  }

  get messages(): Messages {
    const messages = new Messages();

    if (this.plugins?.size) {
      messages.add([
        new SystemMessage(PLUGIN_SYSTEM_MESSAGE()),
        new UserMessage(PLUGIN_USER_MESSAGE(this.plugins)),
        ...(this.memory?.messages || []),
      ]);
    } else {
      messages.add([
        new SystemMessage(DEFAULT_SYSTEM_MESSAGE),
        ...(this.memory?.messages || []),
      ]);
    }

    return messages;
  }

  get threadMessages() {
    return this.messages.threadMessages;
  }

  toDTO() {
    const dto = instanceToPlain(this.threadMessages, { groups: ["stream"] });
    return dto;
  }
}
