import { Component, JSX, Show, splitProps } from "solid-js";
import { styled } from "solid-styled-components";
import { flexbox, FlexboxProps, space, SpaceProps } from "styled-system";
import { shortcutStore } from "~/store";
import { Icon } from "./icon.component";
import { LoadingIndicator } from "./loading-indicator.component";
import { Shortcut } from "./shortcut.component";
import { Text } from "./text.component";

type StyledProps = SpaceProps & FlexboxProps;

interface SWrapperProps extends StyledProps {
  disabled?: boolean;
}

const SWrapper = styled("button")<SWrapperProps>`
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  padding: 6px 8px;
  margin: 0;
  background: ${(props) => props.theme?.colors.gray4};
  opacity: ${(props) => (props.disabled ? 0.6 : undefined)};
  border: ${(props) => `0.5px solid ${props.theme?.colors.gray2}`};
  border-radius: 4px;

  &:hover {
    background: ${(props) =>
      !props.disabled ? props.theme?.colors.gray3 : undefined};
  }

  &:active {
    background: ${(props) =>
      !props.disabled ? props.theme?.colors.gray2 : undefined};
  }

  &:focus-visible {
    outline-style: none;
    outline-width: 0;
  }

  ${space};
  ${flexbox};
`;

interface Props extends JSX.HTMLAttributes<HTMLButtonElement>, StyledProps {
  children: string;
  onClick: () => void;
  shortcutIndex?: number;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: Component<Props> = ($props) => {
  const { isShortcutsVisible } = shortcutStore;

  const [props, rest] = splitProps($props, [
    "children",
    "onClick",
    "shortcutIndex",
    "selected",
    "disabled",
    "loading",
  ]);

  return (
    <SWrapper
      type="button"
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      {...rest}
    >
      <Text.Callout fontWeight="medium">
        <Show
          fallback={props.children}
          when={isShortcutsVisible() && props.shortcutIndex !== undefined}
        >
          <Shortcut
            text={props.children}
            shortcutIndex={props.shortcutIndex as number}
            onTriggered={props.onClick}
          />
        </Show>
      </Text.Callout>
      {props.selected ? (
        <Icon
          ml="8px"
          size="16px"
          name="check-circle"
          stroke="green"
          strokeWidth="2px"
        />
      ) : null}
      {props.loading ? <LoadingIndicator ml="8px" size="12px" /> : null}
    </SWrapper>
  );
};
