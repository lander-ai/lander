import { relaunch } from "@tauri-apps/api/process";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";

export const checkForUpdates = async () => {
  try {
    const { shouldUpdate } = await checkUpdate();

    if (shouldUpdate) {
      await installUpdate();

      await relaunch();
    }
  } catch {
    /* empty */
  }
};
