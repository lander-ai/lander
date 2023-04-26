import { createRoot, createSignal } from "solid-js";

export const mouseStore = createRoot(() => {
  const [isMouseActive, setIsMouseActive] = createSignal(false);

  return { isMouseActive, setIsMouseActive };
});
