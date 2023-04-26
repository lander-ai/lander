import { NetworkRequest } from "./network.service";

export class NetworkService {
  static shared = new NetworkService();

  static isStreaming = false;

  private constructor() {}

  async stream(
    _networkURL: NetworkRequest,
    callback: (response: string) => void
  ) {
    NetworkService.isStreaming = true;

    const data =
      "A question is an inquiry or a request for information or clarification. It is a sentence or phrase that seeks knowledge, understanding, or an answer to something that is not known or clear. Questions can be asked to gather information, initiate a discussion, express curiosity, or to challenge assumptions. \n\nQuestions can be open-ended or closed-ended, and they can be used in a wide range of contexts, including conversations, interviews, surveys, research, and learning. Asking questions is an important way to acquire new information, deepen understanding, and communicate effectively with others.";

    const chunks = data.match(/[\s\S]{1,6}/g) as RegExpMatchArray;

    let isCanceled = false;

    new Promise(async () => {
      for await (const message of chunks) {
        if (!isCanceled) {
          await new Promise((r) => setTimeout(r, 40));
          callback(message);
        }
      }

      NetworkService.isStreaming = false;
    });

    return {
      cancel: () => {
        isCanceled = true;
        NetworkService.isStreaming = false;
      },
    };
  }
}
