import {
  Component,
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  Show,
  splitProps,
} from "solid-js";
import { styled } from "solid-styled-components";
import { shortcutStore } from "~/store";
import { Text } from "./text.component";

const SWrapper = styled("div")`
  position: relative;
`;

export const SInput = styled("input")`
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  box-sizing: border-box;
  font: inherit;
  color: ${(props) => props.theme?.colors.gray};
  width: 22px;
  height: 22px;
  border: 1px solid
    ${(props) =>
      !props.disabled ? props.theme?.colors.gray : props.theme?.colors.gray4};
  border-radius: 4px;
  transform: translateY(-0.075em);
  display: grid;
  place-content: center;

  &:before {
    content: "";
    width: 14px;
    height: 14px;
    clip-path: polygon(
      17.67% 58.69%,
      10.25% 71.89%,
      54.09% 96.54%,
      96.87% 20.46%,
      84.35% 13.42%,
      48.99% 76.3%
    );
    transform: scale(0);
    transform-origin: center;
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em var(--form-control-color);
    background-color: ${(props) => props.theme?.colors.text};
  }

  &:checked::before {
    transform: scale(1);
  }

  &:focus {
    outline: max(2px, 0.15em) solid currentColor;
    outline-offset: max(2px, 0.15em);
  }

  &:hover {
    background: ${(props) => props.theme?.colors.gray2};
  }
`;

const SShortcutTextWrapper = styled("div")<{ selected: boolean }>`
  position: absolute;
  top: 0;
  width: 22px;
  height: 22px;
  margin: 0;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  background: ${(props) =>
    props.selected ? props.theme?.colors.gray2 : props.theme?.colors.gray6};
  border-radius: 4px;
  display: grid;
  align-items: center;
  justify-content: center;
  margin-left: 1px;
`;

interface Props extends JSX.HTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
  shortcutKey?: string;
}

export const Checkbox: Component<Props> = ($props) => {
  const [props, rest] = splitProps($props, ["ref", "shortcutKey", "disabled"]);

  const { isShortcutsVisible } = shortcutStore;

  let ref: HTMLInputElement | undefined;

  const [isSelected, setIsSelected] = createSignal(!!ref?.checked);

  createEffect(() => {
    if (ref && typeof props.ref === "function") {
      props.ref(ref);
    }

    if (ref) {
      setIsSelected(ref.checked);
    }
  });

  createEffect(() => {
    if (!props.shortcutKey) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.altKey) {
        const key = event.code.includes("Key")
          ? event.code[event.code.length - 1].toLowerCase()
          : event.code.includes("Digit")
          ? event.code.replace("Digit", "")
          : undefined;

        if (key === props.shortcutKey) {
          event.preventDefault();
          ref?.click();
        }
      }
    };

    window.addEventListener("keydown", handler);

    onCleanup(() => {
      window.removeEventListener("keydown", handler);
    });
  });

  createEffect(() => {
    const handler = () => {
      setIsSelected(!!ref?.checked);
    };

    ref?.addEventListener("click", handler);

    onCleanup(() => {
      ref?.removeEventListener("click", handler);
    });
  });

  return (
    <SWrapper>
      <SInput
        type="checkbox"
        disabled={props.disabled}
        ref={(el) => (ref = el)}
        {...rest}
      />
      <Show when={!props.disabled && props.shortcutKey && isShortcutsVisible()}>
        <SShortcutTextWrapper selected={isSelected()}>
          <Text.Callout>{props.shortcutKey}</Text.Callout>
        </SShortcutTextWrapper>
      </Show>
    </SWrapper>
  );
};
