import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { Icon, Text } from "~/components/atoms";

const SWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  gap: 16px;
  justify-content: center;
  align-items: center;
  height: 60px;
`;

const SIconWrapper = styled("div")<{ selected: boolean }>`
  display: grid;
  align-items: center;
  justify-items: center;
  border: 0.5px solid ${(props) => props.theme?.colors.gray4};
  padding: 12px;
  border-radius: 8px;
  background: ${(props) =>
    props.selected ? props.theme?.colors.gray3 : undefined};

  &:hover {
    background: ${(props) => props.theme?.colors.gray3};
  }
`;

export enum SettingsView {
  General,
  Account,
}

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
        <Text.Caption fontWeight="medium" mt="4px">
          General
        </Text.Caption>
      </SIconWrapper>

      <SIconWrapper
        selected={props.view === SettingsView.Account}
        onClick={() => props.onChange(SettingsView.Account)}
      >
        <Icon name="user-2" size="22px" />
        <Text.Caption fontWeight="medium" mt="4px">
          Account
        </Text.Caption>
      </SIconWrapper>
    </SWrapper>
  );
};
