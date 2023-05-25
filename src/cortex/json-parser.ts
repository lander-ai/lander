type ListenerEvent = "data" | "end";

type Listener<Type extends Record<string, unknown>> =
  | {
      event: "data";
      callback: (data: Partial<Type>) => void;
    }
  | {
      event: "end";
      callback: (data: Partial<Type>) => void;
    };

export class JSONParser<Type extends Record<string, unknown>> {
  private data = "";

  private response: Partial<Type> = {} as Type;

  private listeners = new Array<Listener<Type>>();

  private partialJSONParse(str: string, attempts = 0): Type | undefined {
    try {
      return JSON.parse(str.trim());
    } catch (error) {
      if (error instanceof SyntaxError) {
        if (attempts === 1) {
          return undefined;
        }

        return this.partialJSONParse(str + '"}', attempts + 1);
      }

      return undefined;
    }
  }

  push(data: string) {
    this.data += data;

    const partialJSON = this.partialJSONParse(this.data);

    if (partialJSON) {
      this.response = partialJSON;

      this.listeners.forEach((listener) => {
        if (listener.event === "data") {
          listener.callback(this.response);
        }
      });
    }
  }

  close() {
    const response = { ...this.response };

    if (Object.keys(response).length) {
      this.listeners.forEach((listener) => {
        if (listener.event === "end") {
          listener.callback(response);
        }
      });
    }
    this.data = "";
    this.response = {};
  }

  on(event: "data", callback: (data: Type) => void): void;

  on(event: "end", callback: (data: Type) => void): void;

  on(event: ListenerEvent, callback: Listener<Type>["callback"]) {
    this.listeners.push({ event, callback } as Listener<Type>);
  }

  unsubscribe() {
    this.listeners = [];
  }
}
