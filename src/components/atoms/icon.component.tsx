import { Component, JSX, lazy, splitProps, Suspense } from "solid-js";
import { styled, useTheme } from "solid-styled-components";
import { space, SpaceProps } from "styled-system";

type StyledProps = SpaceProps;

interface SWrapperProps extends StyledProps {
  size: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
}

const SWrapper = styled("svg")<SWrapperProps>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  stroke: ${(props) => props.stroke || props.theme?.colors.text};
  fill: ${(props) => props.fill};
  stroke-width: ${(props) => props.strokeWidth};
  ${space};
`;

export type IconName =
  | "air"
  | "alarm"
  | "apple"
  | "arrow-circle-down"
  | "arrow-circle-left"
  | "arrow-circle-right"
  | "arrow-circle-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "arrow-small-down"
  | "arrow-small-left"
  | "arrow-small-right"
  | "arrow-small-up"
  | "arrow-up"
  | "at-email"
  | "attachment"
  | "basket"
  | "basketball"
  | "bell-disabled"
  | "bell"
  | "block-1"
  | "block-2"
  | "blood-drip-minus"
  | "blood-drip-plus"
  | "blood-minus"
  | "blood-plus"
  | "bluetooth"
  | "bolt"
  | "bone-broken"
  | "bone"
  | "bookmark"
  | "brain"
  | "calendar-check"
  | "calendar-clock"
  | "calendar-cross"
  | "calendar-edit"
  | "calendar-link"
  | "calendar-lock"
  | "calendar-minus"
  | "calendar-plus"
  | "calendar-user"
  | "calendar-warning"
  | "calendar"
  | "cam-disabled"
  | "cam"
  | "camera-disabled"
  | "camera"
  | "capsule-blister"
  | "capsule"
  | "cardiology"
  | "cart-1"
  | "cart-2"
  | "cart-3"
  | "cart-4"
  | "cast"
  | "chart-vertical"
  | "chart"
  | "check-circle"
  | "check-small"
  | "check"
  | "chevron-circle-down"
  | "chevron-circle-left"
  | "chevron-circle-right"
  | "chevron-circle-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "chevron-small-down"
  | "chevron-small-left"
  | "chevron-small-right"
  | "chevron-small-up"
  | "chevron-up"
  | "circle"
  | "clock"
  | "cloud"
  | "coin"
  | "command"
  | "copy"
  | "creditcard"
  | "cross-circle"
  | "cross-small"
  | "cross"
  | "crown-1"
  | "crown-2"
  | "cut"
  | "delete"
  | "dislike"
  | "dna"
  | "document-check"
  | "document-clean"
  | "document-cross"
  | "document-filled"
  | "document-minus"
  | "document-plus"
  | "download"
  | "ear"
  | "edit-1"
  | "edit-2"
  | "edit-3"
  | "edit-4"
  | "emote-normal"
  | "emote-sad"
  | "emote-smile"
  | "explore"
  | "eye-closed"
  | "eye-open"
  | "faceid"
  | "female"
  | "filters-1"
  | "filters-2"
  | "filters-3"
  | "flag-1"
  | "flag-2"
  | "flag-3"
  | "forward"
  | "fullscreen"
  | "gift"
  | "globe-1"
  | "grid-2-horizontal"
  | "grid-2-vertical"
  | "grid-4"
  | "headphones"
  | "heart"
  | "home-1"
  | "home-2"
  | "home-heart"
  | "home-hospital"
  | "horizontal"
  | "hourglass"
  | "ice"
  | "image-1"
  | "inbox"
  | "info-circle"
  | "info-small"
  | "info"
  | "key"
  | "laptop"
  | "like"
  | "link"
  | "list-center"
  | "list-left"
  | "list-pointers"
  | "list-right"
  | "location-1"
  | "location-2"
  | "location-med-1"
  | "location-med-2"
  | "lock-off"
  | "lock-on"
  | "login"
  | "logout"
  | "lungs"
  | "mail"
  | "male"
  | "map"
  | "medkit"
  | "meds"
  | "menu-hamburger"
  | "menu-horizontal"
  | "menu-vertical"
  | "message-circle-dots"
  | "message-circle-lines"
  | "message-circle"
  | "message-square-dots"
  | "message-square-lines"
  | "message-square"
  | "microphone-disabled"
  | "microphone"
  | "minus-circle"
  | "minus-small"
  | "minus"
  | "money"
  | "moon"
  | "music"
  | "navigation"
  | "newscreen"
  | "next"
  | "nose"
  | "offer"
  | "package"
  | "pause"
  | "phone-call"
  | "phone-cross"
  | "phone-down"
  | "phone"
  | "pin-1"
  | "pin-2"
  | "pinpaper-check"
  | "pinpaper-cross"
  | "pinpaper-filled"
  | "pinpaper-minus"
  | "pinpaper-plus"
  | "plaster-1"
  | "plaster-2"
  | "play"
  | "plus-circle"
  | "plus-small"
  | "plus"
  | "power"
  | "pressure-gauge"
  | "previous"
  | "print"
  | "question-circle"
  | "question-small"
  | "question"
  | "quote"
  | "redo-circle"
  | "redo-small"
  | "redo"
  | "refresh-circle"
  | "refresh-small"
  | "refresh"
  | "resize-circle-horizontal"
  | "resize-circle-vertical"
  | "resize-small-horizontal"
  | "resize-small-vertical"
  | "rewind"
  | "rotate-circle-left"
  | "rotate-circle-right"
  | "rotate-left"
  | "rotate-right"
  | "rotate-small-left"
  | "rotate-small-right"
  | "save"
  | "screen-disabled"
  | "screen-share"
  | "screen"
  | "search"
  | "send-1"
  | "send-2"
  | "settings"
  | "share-1"
  | "share-2"
  | "shield-check"
  | "shield-cross"
  | "shield-empty"
  | "shirt"
  | "smartphone"
  | "smartwach-cardio"
  | "smartwach-heart"
  | "smartwach-plus"
  | "sound-0"
  | "sound-1"
  | "sound-2"
  | "speaker-0"
  | "speaker-1"
  | "speaker-2"
  | "speaker-cross"
  | "speaker-disabled"
  | "star-1"
  | "star-2"
  | "stethoscope"
  | "stop"
  | "stopwatch"
  | "suitcase"
  | "sun"
  | "syringe"
  | "tag"
  | "test-tube"
  | "thermometer"
  | "tooth"
  | "trash-1"
  | "trash-2"
  | "trending-down"
  | "trending-up"
  | "trophy"
  | "umbrella-1"
  | "umbrella-2"
  | "undo-circle"
  | "undo-small"
  | "undo"
  | "upload"
  | "user-1"
  | "user-2"
  | "user-check"
  | "user-cross"
  | "user-heart"
  | "user-info"
  | "user-minus"
  | "user-plus"
  | "user-question"
  | "user-warning"
  | "users-more"
  | "users"
  | "vertical"
  | "virus"
  | "wallet"
  | "wand"
  | "warning-circle"
  | "warning-small"
  | "warning"
  | "waterdrop"
  | "wheelchair"
  | "wifi"
  | "windows"
  | "zoom-in"
  | "zoom-out";

interface Props extends StyledProps, JSX.HTMLAttributes<SVGSVGElement> {
  name: IconName;
  size: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
}

const importIcon = (name: IconName) => () => {
  return import(
    /* @vite-ignore */ `../../assets/icons/${name}.svg?component-solid`
  );
};

export const Icon: Component<Props> = ($props) => {
  const [props, rest] = splitProps($props, [
    "name",
    "size",
    "fill",
    "stroke",
    "strokeWidth",
  ]);

  const theme = useTheme();

  const stroke = () => {
    if (!props.stroke) {
      return undefined;
    }

    return (
      theme.colors[props.stroke as keyof typeof theme.colors] || props.stroke
    );
  };

  const fill = () => {
    if (!props.fill) {
      return undefined;
    }

    return theme.colors[props.fill as keyof typeof theme.colors] || props.fill;
  };

  return (
    <Suspense fallback={<SWrapper size={props.size} {...rest} />}>
      <SWrapper
        as={lazy(importIcon(props.name))}
        viewBox="0 0 24 24"
        size={props.size}
        fill={fill()}
        stroke={stroke()}
        strokeWidth={props.strokeWidth}
        {...rest}
      />
    </Suspense>
  );
};
