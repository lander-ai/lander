import { listen } from "@tauri-apps/api/event";
import { batch, createEffect, onMount } from "solid-js";
import { __dev__ } from "~/constants";
import { CommandType, User } from "~/models";
import { useUser } from "~/queries";
import {
  EventKey,
  EventService,
  InvokeService,
  StorageService,
} from "~/services";
import { HTTPError, NetworkService } from "~/services/network.service";
import { commandStore, mouseStore, queryStore, router, View } from "~/store";
import { chatStore } from "~/store/chat.store";
import { networkStore } from "~/store/network.store";
import { checkForUpdates } from "./check-for-updates";
import { getCommandSection, getCommandSections } from "./command-sections";

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
    setHighlightedCommand,
  } = commandStore;
  const { queryRef } = queryStore;
  const { view } = router;
  const { setChatCount, setChatCountTTL, setChatLimit } = chatStore;
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

    let deviceID = (await StorageService.shared.get("device_id")) as
      | string
      | null;

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
      await StorageService.shared.set("device_id", deviceID);
      await NetworkService.shared.load(User.requests.anonymous(deviceID));
    }

    return true;
  };

  onMount(async () => {
    setIsOffline(!(await authenticate()));

    NetworkService.shared.addListener("stream", (response) => {
      const {
        chat_count: chatCount,
        chat_count_ttl: chatCountTTL,
        chat_limit: chatLimit,
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
    });

    setCommandSections(await getCommandSections());

    const hotkey = (await StorageService.shared.get(
      "main_window_hotkey"
    )) as string;

    if (hotkey) {
      await InvokeService.shared.registerMainWindowHotkey(hotkey);
    } else {
      await InvokeService.shared.openSettingsWindow();
    }

    await InvokeService.shared.initPanel();

    setInterval(() => {
      if (__dev__ || isOffline()) {
        return;
      }

      if (document.visibilityState === "hidden") {
        checkForUpdates();
      }
    }, 60 * 1000);

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

      if (view() === View.Command) {
        queryRef()?.select();
      }

      batch(async () => {
        setHighlightedCommand(undefined);
        setCommandSection(
          CommandType.AI,
          await getCommandSection(CommandType.AI, { focusedApplication })
        );
        setFocusedApplication(focusedApplication);
      });
    });

    window.addEventListener("online", async () => {
      setIsOffline(!(await authenticate()));
    });

    window.addEventListener("offline", () => {
      setIsOffline(true);
    });
  });

  createEffect(() => {
    if (isOffline()) {
      setTimeout(async () => {
        if (navigator.onLine) {
          setIsOffline(!(await authenticate()));
        }
      }, 60 * 1000);
    }
  });
};
