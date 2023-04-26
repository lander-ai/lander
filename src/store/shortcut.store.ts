import { createRoot, createSignal } from "solid-js";

export const shortcutStore = createRoot(() => {
  const [isShortcutsVisible, setIsShortcutsVisible] = createSignal(false);

  return { isShortcutsVisible, setIsShortcutsVisible };
});
