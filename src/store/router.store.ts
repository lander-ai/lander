import { createRoot, createSignal } from "solid-js";

export enum View {
  Command,
  Chat,
}

export const router = createRoot(() => {
  const [view, setView] = createSignal(View.Command);

  const navigate = (view: View) => {
    setView(view);
  };

  return { view, navigate };
});
