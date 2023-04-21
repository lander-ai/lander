import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { Text } from "~/components/atoms";
import { Application } from "~/models";

const SWrapper = styled("div")`
  display: grid;
  gap: 16px;
  padding: 0 12px;
  padding-top: 16px;
  grid-template-columns: max-content 1fr max-content;
  align-items: center;
  border-radius: 8px;
`;

const SApplicationIcon = styled("img")`
  height: 24px;
  width: 24px;
`;

const SSubtitle = styled(Text.Callout)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

interface Props {
  focusedApplication: Application;
}

export const CommandOverviewFocusedApplication: Component<Props> = (props) => {
  return (
    <SWrapper>
      <SApplicationIcon
        draggable={false}
        src={`${convertFileSrc(props.focusedApplication.icon)}`}
      />
      <div>
        <Text.Callout fontWeight="600">
          {props.focusedApplication.name} (selected text)
        </Text.Callout>
        <SSubtitle mt="4px" color="gray">
          {props.focusedApplication.selectedText}
        </SSubtitle>
      </div>
    </SWrapper>
  );
};
