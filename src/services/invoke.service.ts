import { invoke } from "@tauri-apps/api";
import { Application, ApplicationData } from "~/models";
import { convertKeysFromSnakeCaseToCamelCase } from "~/util/convert-keys-from-snake-case-to-camel-case";

export class InvokeService {
  static shared = new InvokeService();

  private constructor() {}

  private parse(data: string) {
    const json = JSON.parse(data);

    return convertKeysFromSnakeCaseToCamelCase(json) as unknown;
  }

  async initPanel() {
    await invoke("init_panel");
  }

  async togglePanel() {
    await invoke("toggle_panel");
  }

  async hidePanel() {
    await invoke("hide_panel");
  }

  async openSettingsWindow() {
    await invoke("open_settings_window");
  }

  async registerMainWindowHotkey(hotkey: string) {
    await invoke("register_main_window_hotkey", { hotkey });
  }

  async stream(opts: {
    url: string;
    method: "GET" | "POST";
    body?: string;
    headers?: string;
  }) {
    const response = (await invoke("stream", {
      url: opts.url,
      body: opts.body,
      headers: opts.headers,
    })) as string;

    return response;
  }

  async cancelStream() {
    await invoke("cancel_stream");
  }

  async getInstalledApplications() {
    const response = (await invoke("get_installed_applications")) as string;
    const applications = this.parse(response) as Array<ApplicationData>;

    return applications.map((application) => new Application(application));
  }

  async getFocusedApplication() {
    const response = (await invoke("get_focused_application")) as string;

    if (!response || response === "null") {
      return undefined;
    }

    const application = this.parse(response) as ApplicationData;

    return new Application(application);
  }

  async launchApplication(id: string) {
    await invoke("launch_application", { id });
  }

  async copyText(text: string) {
    await invoke("copy_text_to_clipboard", { text });
  }

  async getClipboardText() {
    const text = await invoke("get_text_from_clipboard");
    return text as string;
  }

  async insertText(text: string) {
    await invoke("insert_text", { text });
  }

  async replaceText(text: string) {
    await invoke("replace_text", { text });
  }

  async fetchUser() {
    await invoke("fetch_user");
  }
}
