import { createRoot, createSignal } from "solid-js";

export const queryStore = createRoot(() => {
  const [query, setQuery] = createSignal("");
  const [queryRef, setQueryRef] = createSignal<HTMLInputElement>();

  return { query, setQuery, queryRef, setQueryRef };
});
