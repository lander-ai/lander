import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { Icon, Text } from "~/components/atoms";
import { SettingsView } from "~/types";

const SWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  gap: 16px;
  justify-content: center;
  align-items: center;
`;

const SIconWrapper = styled("div")<{ selected: boolean }>`
  display: grid;
  grid-template-rows: max-content max-content;
  align-items: center;
  align-content: center;
  justify-items: center;
  gap: 4px;
  border: 0.5px solid ${(props) => props.theme?.colors.gray4};
  height: 60px;
  width: 90px;
  border-radius: 8px;
  background: ${(props) =>
    props.selected ? props.theme?.colors.gray3 : undefined};

  &:hover {
    background: ${(props) => props.theme?.colors.gray3};
  }
`;

interface Props {
  view: SettingsView;
  onChange: (view: SettingsView) => void;
}

export const SettingsHeader: Component<Props> = (props) => {
  return (
    <SWrapper>
      <SIconWrapper
        selected={props.view === SettingsView.General}
        onClick={() => props.onChange(SettingsView.General)}
      >
        <Icon name="settings" size="22px" />
        <Text.Caption fontWeight="medium">General</Text.Caption>
      </SIconWrapper>

      <SIconWrapper
        selected={props.view === SettingsView.Account}
        onClick={() => props.onChange(SettingsView.Account)}
      >
        <Icon name="user-2" size="22px" />
        <Text.Caption fontWeight="medium">Account</Text.Caption>
      </SIconWrapper>

      <SIconWrapper
        selected={props.view === SettingsView.About}
        onClick={() => props.onChange(SettingsView.About)}
      >
        <Icon name="dna" size="22px" />
        <Text.Caption fontWeight="medium">About</Text.Caption>
      </SIconWrapper>
    </SWrapper>
  );
};
