import { ThreadType } from "~/models";
import { NetworkRequest, NetworkService } from "~/services/network.service";
import { JSONParser } from "./json-parser";
import { Memory } from "./memory";
import { AIMessage } from "./message";
import { Plugin } from "./plugin";
import { FinalPromptResponse, PluginPromptResponse, Prompt } from "./prompt";

type ListenerEvent = "response" | "plugin" | "end";

type Listener =
  | {
      event: "response";
      callback: (data: string) => void;
    }
  | {
      event: "plugin";
      callback: (plugin: Plugin, input: string) => void;
    }
  | {
      event: "end";
      callback: () => void;
    };

export abstract class Model {
  memory = new Memory();

  plugins = new Set<Plugin>();

  jsonParser = new JSONParser<
    Partial<PluginPromptResponse | FinalPromptResponse>
  >();

  listeners = new Array<Listener>();

  iterations = 0;

  maxIterations = -1;

  private response = "";

  private streamedResponse = "";

  on(event: "response", callback: (data: string) => void): void;

  on(event: "plugin", callback: (plugin: Plugin, input: string) => void): void;

  on(event: "end", callback: () => void): void;

  on(event: ListenerEvent, callback: Listener["callback"]) {
    this.listeners.push({ event, callback } as Listener);
  }

  init() {
    this.iterations += 1;

    if (this.iterations > this.maxIterations) {
      this.listeners.forEach((listener) => {
        if (listener.event === "response") {
          listener.callback("[LANDER_STREAM_ERROR]");
        }
      });
      return;
    }

    this.jsonParser.on("data", (data) => {
      if ("response" in data && data.response?.replace) {
        const message = data.response.replace(this.streamedResponse, "");
        this.listeners.forEach((listener) => {
          if (listener.event === "response") {
            listener.callback(message);
            this.streamedResponse = data.response!;
          }
        });
      }
    });

    this.jsonParser.on("end", async (data) => {
      if ("plugin" in data && data.input && data.plugin) {
        const plugin = Array.from(this.plugins).find(
          (plugin) => plugin.name === data.plugin
        );

        if (plugin) {
          this.listeners.forEach((listener) => {
            if (listener.event === "plugin") {
              listener.callback(plugin, data.input!);
            }
          });

          let pluginResponse = "";

          try {
            pluginResponse = await plugin.call(data.input);
          } catch {
            pluginResponse =
              "No response from plugin, please try again with a different input.";
          }

          this.memory.messages.add(new AIMessage(JSON.stringify(data)));

          let formattedResponse = `Response from the plugin:\n\n${pluginResponse}\n\n`;

          if (this.iterations + 1 >= this.maxIterations) {
            formattedResponse +=
              "You have reached your maximum iterations so you must output your final answer (option 1).";
          } else {
            formattedResponse +=
              "You can either use an additional plugin (option 2) or output your final answer (option 1).";
          }

          this.call(formattedResponse);
        } else {
          this.listeners.forEach((listener) => {
            if (listener.event === "end") {
              listener.callback();
            }
          });
        }
      }
    });
  }

  onStreamMessage(data: string) {
    this.response += data;

    if (!this.plugins.size) {
      this.listeners.forEach((listener) => {
        if (listener.event === "response") {
          listener.callback(data);
        }
      });
    } else {
      if (
        this.response.trim().replace(/\s+/g, "").startsWith('{"plugin"') ||
        /^\{("?)(p(l(u(g(i(n)?)?)?)?)?)?$/.test(
          this.response.trim().replace(/\s+/g, "")
        ) ||
        this.response.trim().replace(/\s+/g, "").startsWith('{"response"') ||
        /^\{("?)(r(e(s(p(o(n(s(e)?)?)?)?)?)?)?)?$/.test(
          this.response.trim().replace(/\s+/g, "")
        )
      ) {
        this.jsonParser.push(data);
      } else {
        const message = this.response.replace(this.streamedResponse, "");
        this.listeners.forEach((listener) => {
          if (listener.event === "response") {
            listener.callback(message);
            this.streamedResponse = this.response;
          }
        });
      }
    }
  }

  onStreamEnd() {
    this.jsonParser.close();
    this.jsonParser.unsubscribe();
    this.response = "";
    this.streamedResponse = "";

    if (!this.plugins.size) {
      this.listeners.forEach((listener) => {
        if (listener.event === "end") {
          listener.callback();
        }
      });
    }
  }

  abstract call(message: string): void;
}

export class OpenAIChatModel extends Model {
  maxIterations = 4;

  async call(message: string) {
    const prompt = new Prompt({
      input: message,
      plugins: this.plugins,
      memory: this.memory,
    });

    this.init();

    await NetworkService.shared.stream(
      new NetworkRequest("/chat", "POST", {
        id: crypto.randomUUID(),
        type: ThreadType.Chat,
        messages: prompt.toDTO(),
      }),
      (message) => this.onStreamMessage(message),
      () => this.onStreamEnd()
    );
  }
}
