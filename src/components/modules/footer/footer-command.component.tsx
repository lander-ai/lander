import { Component, Show } from "solid-js";
import { styled } from "solid-styled-components";
import icon from "~/assets/icon.png";
import { Text } from "~/components/atoms";
import { networkStore } from "~/store/network.store";

const SWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  padding: 0 16px;
`;

const SLogo = styled("img")`
  width: 20px;
  height: 20px;
  justify-self: end;
`;

export const FooterCommand: Component = () => {
  const { isOffline } = networkStore;

  return (
    <SWrapper>
      <Show when={isOffline()}>
        <Text.Callout color="orange" fontWeight="medium">
          Offline
        </Text.Callout>
      </Show>
      <SLogo draggable={false} src={icon} />
    </SWrapper>
  );
};
