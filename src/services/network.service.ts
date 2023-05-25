import { listen } from "@tauri-apps/api/event";
import { Body, fetch, Response } from "@tauri-apps/api/http";
import { __api_endpoint__ } from "~/constants";
import { networkStore } from "~/store/network.store";
import { convertKeysFromSnakeCaseToCamelCase } from "~/util";
import { InvokeService } from "./invoke.service";

interface ClassType {
  new (...args: unknown[]): unknown;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type ModelClass<Model> = Function & { prototype: Model };

interface NetworkResponse<Model> {
  data: Model;
  response: Response<Model>;
}

export class HTTPError extends Error {
  status: number;

  constructor(status: number) {
    super();
    this.status = status;
  }
}

export class NetworkRequest {
  url: URL;
  method: "GET" | "POST" | "DELETE";
  dto?: Record<string, unknown>;

  constructor(
    route: string,
    method: "GET" | "POST" | "DELETE",
    dto?: Record<string, unknown>
  ) {
    const url = new URL(`${__api_endpoint__}${route}`);

    this.url = url;
    this.method = method;
    this.dto = dto;
  }
}

export interface ListenerResponse {
  url: string;
  method: "GET" | "POST";
  headers: Record<string, string>;
}

export type ListenerCallback = (response: ListenerResponse) => void;

export class NetworkService {
  static shared = new NetworkService();

  private static _isStreaming = false;

  static get isStreaming() {
    return this._isStreaming;
  }

  static set isStreaming(value: boolean) {
    const { setIsStreaming } = networkStore;
    setIsStreaming(value);

    if (!value) {
      this.subscription = undefined;
    }

    this._isStreaming = value;
  }

  static subscription?: {
    response: unknown;
    cancel: () => void;
  };

  listeners: Array<{ id: string; type: "stream"; callback: ListenerCallback }> =
    [];

  private constructor() {}

  async load<Model = null>(
    model: ModelClass<Model>,
    networkURL: NetworkRequest
  ): Promise<NetworkResponse<Model>>;

  async load<Model = null>(
    networkURL: NetworkRequest
  ): Promise<NetworkResponse<Model>>;

  async load<Model = null>(
    arg1: ModelClass<Model> | NetworkRequest,
    arg2?: NetworkRequest
  ): Promise<NetworkResponse<Model>> {
    const model = arg2 ? (arg1 as ModelClass<Model>) : null;
    const networkURL = (arg2 || arg1) as NetworkRequest;

    let accessToken = localStorage.getItem("t");

    const response = await fetch<Model>(networkURL.url.href, {
      method: networkURL.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      ...(networkURL.dto ? { body: Body.json(networkURL.dto) } : {}),
    });

    if (!response.ok) {
      console.error(response);
      throw new HTTPError(response.status);
    }

    accessToken = response.headers.access_token;

    if (accessToken) {
      localStorage.setItem("t", accessToken);
    }

    if (!model) {
      return { data: null as Model, response };
    }

    const parsedResponse = convertKeysFromSnakeCaseToCamelCase(
      response.data as Record<string, unknown>
    );

    // TODO: get this to work with arrays

    const cls = new (model as ClassType)({}) as ClassType;

    Object.assign(cls, parsedResponse);

    return { data: cls as Model, response };
  }

  async stream(
    networkURL: NetworkRequest,
    callback: (response: string) => void,
    end?: () => void
  ) {
    NetworkService.isStreaming = true;

    const accessToken = localStorage.getItem("t");

    const unsubscribe = await listen("stream", (event) => {
      const data = event.payload as string;

      if (data === "[END]") {
        unsubscribe();
        NetworkService.isStreaming = false;
        end?.();
        return;
      }

      callback(data.replace(/^data: /, "").replace(/\n\n$/, ""));

      if (data === "[LANDER_STREAM_ERROR]") {
        unsubscribe();
        NetworkService.isStreaming = false;
      }
    });

    const response = await InvokeService.shared.stream({
      url: networkURL.url.href,
      method: networkURL.method as "GET" | "POST",
      ...(networkURL.dto ? { body: JSON.stringify(networkURL.dto) } : {}),
      ...(accessToken
        ? {
            headers: JSON.stringify({
              Authorization: `Bearer ${accessToken}`,
            }),
          }
        : {}),
    });

    this.listeners.forEach(({ type, callback }) => {
      if (type === "stream") {
        callback({
          url: networkURL.url.href,
          method: networkURL.method,
          ...JSON.parse(response),
        });
      }
    });

    NetworkService.subscription = {
      response: JSON.parse(response),
      cancel: () => {
        unsubscribe();
        NetworkService.isStreaming = false;
        InvokeService.shared.cancelStream();
      },
    };

    return NetworkService.subscription!;
  }

  addListener(type: "stream", callback: ListenerCallback) {
    const id = crypto.randomUUID();
    this.listeners.push({ id, type, callback });

    return {
      remove: () => this.removeListener.bind(this)(id),
    };
  }

  private removeListener(id: string) {
    this.listeners = this.listeners.filter((listener) => listener.id !== id);
  }
}
