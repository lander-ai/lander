import { listen } from "@tauri-apps/api/event";
import { batch, onMount } from "solid-js";
import { calculator } from "~/calculator";
import { CommandType, User } from "~/models";
import { useUser } from "~/queries";
import {
  EventKey,
  EventService,
  InvokeService,
  SettingsService,
} from "~/services";
import { HTTPError, NetworkService } from "~/services/network.service";
import { commandStore, mouseStore } from "~/store";
import { chatStore } from "~/store/chat.store";
import { networkStore } from "~/store/network.store";
import {
  getCommandSection,
  getCommandSections,
  getSuggestionsCommandSection,
} from "./command-sections";

let lastCurrencyRefresh: Date | undefined = undefined;

const installedApplicationsEvent = new EventService(
  EventKey.InstalledApplications,
  async (applications) => {
    commandStore.setCommandSection(
      CommandType.Application,
      await getCommandSection(CommandType.Application, { applications })
    );
  }
);

export const useLaunch = () => {
  const { setIsMouseActive } = mouseStore;
  const {
    setCommandSection,
    setCommandSections,
    setFocusedApplication,
    commandSections,
  } = commandStore;
  const {
    setChatCount,
    setChatCountTTL,
    setChatLimit,
    setChatPluginCount,
    setChatPluginCountTTL,
    setChatPluginLimit,
  } = chatStore;
  const { isOffline, setIsOffline } = networkStore;

  const user = useUser({ enabled: false });

  let lastMousePosition:
    | {
        x: number;
        y: number;
      }
    | undefined;

  const authenticate = async () => {
    if (!navigator.onLine) {
      return false;
    }

    let deviceID = localStorage.getItem("device_id");

    try {
      await NetworkService.shared.load(User.requests.whoami());
    } catch (error) {
      if (error instanceof HTTPError && error.status === 401) {
        deviceID = null;
        localStorage.removeItem("t");
      } else {
        return false;
      }
    }

    if (!deviceID || !localStorage.getItem("t")) {
      deviceID = crypto.randomUUID();
      localStorage.setItem("device_id", deviceID);
      await NetworkService.shared.load(User.requests.anonymous(deviceID));
    }

    return true;
  };

  onMount(async () => {
    setIsOffline(!(await authenticate()));

    await calculator.refreshCurrencyData();

    NetworkService.shared.addListener("stream", (response) => {
      const {
        chat_count: chatCount,
        chat_count_ttl: chatCountTTL,
        chat_limit: chatLimit,
        chat_plugin_count: chatPluginCount,
        chat_plugin_count_ttl: chatPluginCountTTL,
        chat_plugin_limit: chatPluginLimit,
      } = response.headers;

      if (
        chatCount !== undefined &&
        chatCountTTL !== undefined &&
        chatLimit !== undefined
      ) {
        localStorage.setItem("chat_count", chatCount);
        localStorage.setItem("chat_count_ttl", chatCountTTL);
        localStorage.setItem("chat_count_limit", chatLimit);

        setChatCount(parseInt(chatCount));
        setChatCountTTL(parseInt(chatCountTTL));
        setChatLimit(parseInt(chatLimit));
      }

      if (
        chatPluginCount !== undefined &&
        chatPluginCountTTL !== undefined &&
        chatPluginLimit !== undefined
      ) {
        localStorage.setItem("chat_plugin_count", chatPluginCount);
        localStorage.setItem("chat_plugin_count_ttl", chatPluginCountTTL);
        localStorage.setItem("chat_plugin_count_limit", chatPluginLimit);

        setChatPluginCount(parseInt(chatPluginCount));
        setChatPluginCountTTL(parseInt(chatPluginCountTTL));
        setChatPluginLimit(parseInt(chatPluginLimit));
      }
    });

    setCommandSections(await getCommandSections());

    const hotkey = (await SettingsService.shared.get("main_window_hotkey")) as
      | string
      | null;

    if (hotkey) {
      await InvokeService.shared.registerMainWindowHotkey(hotkey);
    } else {
      await InvokeService.shared.openSettingsWindow();
    }

    await InvokeService.shared.initPanel();

    listen("fetch_user_response", () => {
      user.refetch();
    });

    window.addEventListener("mousemove", (event) => {
      if (
        event.screenX !== lastMousePosition?.x ||
        event.screenY !== lastMousePosition?.y
      ) {
        setIsMouseActive(true);
      }

      lastMousePosition = { x: event.screenX, y: event.screenY };
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        setIsMouseActive(false);
      }
    });

    window.addEventListener("focus", async () => {
      installedApplicationsEvent.emit();

      const focusedApplication =
        await InvokeService.shared.getFocusedApplication();

      const suggestedCommands = await getSuggestionsCommandSection(
        commandSections().flatMap((commandSection) => commandSection.commands)
      );

      const aiCommandSection = await getCommandSection(CommandType.AI, {
        focusedApplication,
      });

      batch(() => {
        if (!isOffline()) {
          setFocusedApplication(focusedApplication);
          setCommandSection(CommandType.AI, aiCommandSection);
        }

        if (suggestedCommands) {
          setCommandSection(
            CommandType.Suggestion,
            suggestedCommands,
            !isOffline() && focusedApplication?.selectedText ? 1 : 0
          );
        }
      });

      setTimeout(async () => {
        setIsOffline(!(await authenticate()));
      });

      setTimeout(async () => {
        if (
          !lastCurrencyRefresh ||
          Number(new Date()) - Number(lastCurrencyRefresh) > 60 * 60 * 1000
        ) {
          await calculator.refreshCurrencyData();
          lastCurrencyRefresh = new Date();
        }
      });
    });

    window.addEventListener("online", async () => {
      setIsOffline(!(await authenticate()));
    });

    window.addEventListener("offline", () => {
      setIsOffline(true);
    });
  });
};
