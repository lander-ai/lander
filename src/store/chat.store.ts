import { createRoot, createSignal } from "solid-js";
import { Plugins } from "~/cortex";
import { Thread, ThreadMessage } from "~/models";

export interface ContextualText {
  provider: "clipboard" | "selection";
  text: string;
  additionalText?: string;
}

export const chatStore = createRoot(() => {
  const [thread, setThread] = createSignal<Thread>();
  const [highlightedMessage, setHighlightedMessage] =
    createSignal<ThreadMessage>();
  const [contextualText, setContextualText] = createSignal<ContextualText>();
  const [chatCount, setChatCount] = createSignal(
    Number(localStorage.getItem("chat_count") || 0)
  );
  const [chatCountTTL, setChatCountTTL] = createSignal(
    Number(localStorage.getItem("chat_count_ttl") || 0)
  );
  const [chatLimit, setChatLimit] = createSignal(
    Number(localStorage.getItem("chat_limit") || 25)
  );
  const [chatPluginCount, setChatPluginCount] = createSignal(
    Number(localStorage.getItem("chat_plugin_count") || 0)
  );
  const [chatPluginCountTTL, setChatPluginCountTTL] = createSignal(
    Number(localStorage.getItem("chat_plugin_count_ttl") || 0)
  );
  const [chatPluginLimit, setChatPluginLimit] = createSignal(
    Number(localStorage.getItem("chat_plugin_limit") || 50)
  );
  const [isPluginsPanelVisible, setIsPluginsPanelVisible] = createSignal(false);
  const [selectedPlugins, setSelectedPlugins] = createSignal(new Plugins());

  return {
    thread,
    setThread,
    highlightedMessage,
    setHighlightedMessage,
    contextualText,
    setContextualText,
    chatCount,
    setChatCount,
    chatCountTTL,
    setChatCountTTL,
    chatLimit,
    setChatLimit,
    chatPluginCount,
    setChatPluginCount,
    chatPluginCountTTL,
    setChatPluginCountTTL,
    chatPluginLimit,
    setChatPluginLimit,
    isPluginsPanelVisible,
    setIsPluginsPanelVisible,
    selectedPlugins,
    setSelectedPlugins,
  };
});
