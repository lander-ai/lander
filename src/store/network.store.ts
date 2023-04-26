import { createRoot, createSignal } from "solid-js";

export const networkStore = createRoot(() => {
  const [isOffline, setIsOffline] = createSignal(false);

  return { isOffline, setIsOffline };
});
