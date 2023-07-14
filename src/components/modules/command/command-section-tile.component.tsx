import { Component, For } from "solid-js";
import { styled } from "solid-styled-components";
import { Text } from "~/components/atoms";
import { CommandSection } from "~/models";
import { CommandTile } from "./command-tile.component";

const SCommandTilesWrapper = styled("div")`
  display: grid;
  padding: 0 12px;
  gap: 4px;

  &:last-child > :last-child {
    margin-bottom: 34px;
  }
`;

interface Props {
  commandSection: CommandSection;
}

export const CommandSectionTile: Component<Props> = (props) => {
  return (
    <>
      <Text.Callout fontWeight="semibold" mx="12px" my="16px">
        {props.commandSection.title}
      </Text.Callout>

      <SCommandTilesWrapper>
        <For each={props.commandSection.commands}>
          {(command) => <CommandTile command={command} />}
        </For>
      </SCommandTilesWrapper>
    </>
  );
};
