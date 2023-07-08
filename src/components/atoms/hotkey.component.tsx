import {
  Component,
  createEffect,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";
import { styled } from "solid-styled-components";
import { __macos__, __windows__ } from "~/constants";
import { Icon } from "./icon.component";
import { Link } from "./link.component";
import { Text } from "./text.component";

let isSetsEqual = (a: Set<unknown>, b: Set<unknown>) => {
  return a.size === b.size && [...a].every((value) => b.has(value));
};

const SWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 16px;
`;

const SListenerWrapper = styled("div")`
  padding: 0 8px;
  height: 36px;
  display: grid;
  align-items: center;
  min-width: 100px;
  background: ${(props) => props.theme?.colors.gray5};
  border: ${(props) => `0.5px solid ${props.theme?.colors.gray3}`};
  border-radius: 4px;
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  gap: 8px;

  &:hover {
    border: ${(props) => `0.5px solid ${props.theme?.colors.gray2}`};
  }
`;

const SKey = styled(Text.Caption)`
  padding: 4px;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme?.colors.gray3};
  background: ${(props) => props.theme?.colors.gray3};
  text-transform: uppercase;
  font-size: 10px;
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
  recommendedHotkey?: string[];
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
        if (recording().size < 1) {
          return;
        }

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

  const handleSetRecommendedHotkey = () => {
    if (!props.recommendedHotkey) {
      return;
    }

    setHotkey(new Set(props.recommendedHotkey));
    props.onChange(props.recommendedHotkey);
  };

  return (
    <SWrapper>
      <SListenerWrapper onClick={() => setIsListening((s) => !s)}>
        <Switch>
          <Match when={isListening() && recording().size}>
            <For each={Array.from(recording())}>
              {(key) => <SKey>{key}</SKey>}
            </For>
          </Match>
          <Match when={isListening()}>
            <Text.Callout fontWeight="medium">Recording</Text.Callout>
          </Match>
          <Match when={!isListening() && hotkey().size}>
            <For each={Array.from(hotkey())}>{(key) => <SKey>{key}</SKey>}</For>
          </Match>
          <Match when>
            <Text.Callout fontWeight="medium">Record</Text.Callout>
          </Match>
        </Switch>
      </SListenerWrapper>

      <Show
        when={
          props.recommendedHotkey &&
          !isSetsEqual(hotkey(), new Set(props.recommendedHotkey)) &&
          !isListening()
        }
      >
        <Link onClick={handleSetRecommendedHotkey}>Use recommended hotkey</Link>
      </Show>

      <Show when={isListening()}>
        <SCloseIconWrapper onClick={() => setIsListening(false)}>
          <Icon name="cross-small" size="24px" />
        </SCloseIconWrapper>
      </Show>
    </SWrapper>
  );
};
