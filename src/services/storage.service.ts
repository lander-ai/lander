import { Store } from "tauri-plugin-store-api";

export class StorageService {
  static shared = new Store("store.dat");

  private constructor() {}
}
