import { Store } from "tauri-plugin-store-api";

export class SettingsService {
  static shared = new Store("settings.json");

  private constructor() {}
}
