import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  Show,
} from "solid-js";
import { styled } from "solid-styled-components";
import { Icon } from "./icon.component";
import { Text } from "./text.component";

const SWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 16px;
`;

const SListenerWrapper = styled("div")`
  padding: 0 12px;
  height: 36px;
  display: grid;
  align-items: center;
  width: 100px;
  background: ${(props) => props.theme?.colors.gray4};
  border: ${(props) => `0.5px solid ${props.theme?.colors.gray2}`};
  border-radius: 4px;

  &:hover {
    background: ${(props) => props.theme?.colors.gray3};
  }
`;

const SCloseIconWrapper = styled("div")`
  height: 24px;
  width: 24px;
  display: grid;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid ${(props) => props.theme?.colors.gray2};

  &:hover {
    background: ${(props) => props.theme?.colors.gray3};
  }
`;

interface Props {
  onChange: (hotkey: string[]) => void;
  defaultValue?: string;
}

export const Hotkey: Component<Props> = (props) => {
  const [isListening, setIsListening] = createSignal(false);
  const [hotkey, setHotkey] = createSignal(
    new Set<string>(props.defaultValue?.split("+"))
  );
  const [recording, setRecording] = createSignal(new Set<string>());

  createEffect(() => {
    if (!isListening()) {
      return;
    }

    setRecording(new Set<string>());

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key === "Meta" ? "Super" : event.key;

      const isModifierKey =
        key === "Alt" ||
        key === "Control" ||
        key === "Shift" ||
        key === "Super";

      if (isModifierKey) {
        setRecording((s) => {
          s.add(key);
          return new Set(s);
        });
      } else if (
        event.code.includes("Key") ||
        event.code === "Space" ||
        event.code === "Enter"
      ) {
        const next = setRecording((s) => {
          s.add(
            event.code.includes("Key")
              ? event.code.replace("Key", "").toUpperCase()
              : event.code
          );
          return new Set(s);
        });

        setHotkey(next);
        setIsListening(false);

        props.onChange(Array.from(next));
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key === "Meta" ? "Super" : event.key;

      const isModifierKey =
        key === "Alt" ||
        key === "Control" ||
        key === "Shift" ||
        key === "Super";

      if (isModifierKey) {
        setRecording((s) => {
          s.delete(key);
          return new Set(s);
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    });
  });

  const getHotkeyText = (keys: Set<string>) => {
    keys = new Set(keys);

    const value = [];

    if (keys.has("Super")) {
      value.push("⌘");
      keys.delete("Super");
    }

    if (keys.has("Control")) {
      value.push("⌃");
      keys.delete("Control");
    }

    if (keys.has("Alt")) {
      value.push("⌥");
      keys.delete("Alt");
    }

    if (keys.has("Shift")) {
      value.push("⇧");
      keys.delete("Shift");
    }

    Array.from(keys).forEach((key) => {
      if (key === "Enter") {
        value.push("⏎");
      } else if (key === "Space") {
        value.push("⎵");
      } else {
        value.push(key);
      }
    });

    return value.join("");
  };

  return (
    <SWrapper>
      <SListenerWrapper onClick={() => setIsListening((s) => !s)}>
        <Text.Callout
          letterSpacing={
            (isListening() && recording().size) ||
            (!isListening() && hotkey().size)
              ? "4px"
              : undefined
          }
          fontWeight="medium"
        >
          {isListening()
            ? getHotkeyText(recording()) || "Recording"
            : getHotkeyText(hotkey()) || "Record"}
        </Text.Callout>
      </SListenerWrapper>

      <Show when={isListening()}>
        <SCloseIconWrapper onClick={() => setIsListening(false)}>
          <Icon name="cross-small" size="24px" />
        </SCloseIconWrapper>
      </Show>
    </SWrapper>
  );
};
