import { Component, createEffect, onCleanup } from "solid-js";

interface Props {
  text: string;
  shortcutIndex: number;
  onTriggered: () => void;
  event?: "keyup" | "keydown";
  disabled?: boolean;
}

export const Shortcut: Component<Props> = (props) => {
  createEffect(() => {
    if (props.disabled) {
      return;
    }

    const keyUpHandler = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        props.onTriggered();
        window.removeEventListener("keyup", keyUpHandler);
      }
    };

    const handler = (event: KeyboardEvent) => {
      if (props.shortcutIndex === undefined) {
        return;
      }

      if (event.altKey) {
        const key = event.code.includes("Key")
          ? event.code[event.code.length - 1].toLowerCase()
          : undefined;

        if (key === props.text[props.shortcutIndex].toLowerCase()) {
          event.preventDefault();

          if (props.event === "keyup") {
            window.addEventListener("keyup", keyUpHandler);
          } else {
            props.onTriggered();
          }
        }
      }
    };

    window.addEventListener(props.event || "keydown", handler);

    onCleanup(() => {
      window.removeEventListener(props.event || "keydown", handler);
    });
  });

  return (
    <>
      <span>{props.text.slice(0, props.shortcutIndex)}</span>
      <span
        style={{ "text-decoration": !props.disabled ? "underline" : undefined }}
      >
        {props.text.slice(props.shortcutIndex, props.shortcutIndex + 1)}
      </span>
      <span>{props.text.slice(props.shortcutIndex + 1)}</span>
    </>
  );
};
