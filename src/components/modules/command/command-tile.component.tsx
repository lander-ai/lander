import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { Text } from "~/components/atoms";
import { Command, CommandType } from "~/models";
import { commandStore, mouseStore, queryStore } from "~/store";

const SWrapper = styled("div")<{ hoverEnabled: boolean; highlighted: boolean }>`
  display: grid;
  gap: 16px;
  grid-template-columns: max-content 1fr max-content;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;

  &:hover {
    background: ${(props) =>
      props.hoverEnabled ? `${props.theme?.colors.gray}22` : undefined};
  }

  &:active {
    background: ${(props) => props.theme?.colors.gray}33;
  }

  background: ${(props) =>
    props.highlighted ? `${props.theme?.colors.gray}33` : undefined};
`;

const SApplicationIcon = styled("img")`
  height: 24px;
  width: 24px;
  object-fit: contain;
`;

interface Props {
  command: Command;
}

export const CommandTile: Component<Props> = (props) => {
  const { setQuery } = queryStore;
  const { isMouseActive } = mouseStore;
  const { highlightedCommand } = commandStore;

  const icon = () => {
    if (
      props.command.icon.startsWith("/src") ||
      props.command.icon.startsWith("/assets")
    ) {
      return props.command.icon;
    }

    return convertFileSrc(props.command.icon);
  };

  const handlePress = () => {
    props.command.onClick();

    if (props.command.id !== "lander-close") {
      setTimeout(() => {
        setQuery("");
      }, 400);
    }
  };

  return (
    <SWrapper
      id={`lander__command-${props.command.id}`}
      hoverEnabled={isMouseActive()}
      highlighted={highlightedCommand()?.id === props.command.id}
      onClick={handlePress}
    >
      <SApplicationIcon draggable={false} src={icon()} />
      <div>
        <Text.Callout>{props.command.title}</Text.Callout>
        <Text.Caption mt="4px" color="gray">
          {props.command.subtitle}
        </Text.Caption>
      </div>
      <Text.Caption color="gray">
        {props.command.type === CommandType.AI
          ? "AI"
          : props.command.type === CommandType.Lander
          ? "Lander"
          : "Open"}
      </Text.Caption>
    </SWrapper>
  );
};
