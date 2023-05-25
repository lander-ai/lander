import { Component, createMemo, For, on, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Button, Checkbox, Text } from "~/components/atoms";
import { CalculatorPlugin, Plugin, SearchPlugin } from "~/cortex";
import { commandStore } from "~/store";
import { chatStore } from "~/store/chat.store";
import { getBrowserDrivers } from "~/util/browser";

const SWrapper = styled("div")`
  height: 100vh;
  width: 50vw;
  position: fixed;
  box-sizing: border-box;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  top: 0;
  right: 0;
  overflow: hidden;
  border: 0.5px solid transparent;
  pointer-events: none;
`;

const SContentWrapper = styled("div")<{ visible: boolean }>`
  height: 100%;
  width: 100%;
  position: relative;
  background: ${(props) => props.theme?.colors.gray6};
  border-left: 1px solid ${(props) => props.theme?.colors.gray4};
  right: ${(props) => (props.visible ? 0 : "-100%")};
  transition: 0.4s right ease-out;
  padding: 8px 16px;
  pointer-events: all;
`;

const SHeader = styled("div")`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  margin-right: 32px;
`;

const SPluginsWrapper = styled("div")`
  display: grid;
  margin-top: 24px;
  gap: 16px;
`;

const SPluginTileWrapper = styled("div")`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
  margin-right: 32px;
`;

interface Props {
  visible: boolean;
}

const searchPlugin = new SearchPlugin();
const calculatorPlugin = new CalculatorPlugin();

const plugins = [searchPlugin, calculatorPlugin];

export const ChatPluginPanel: Component<Props> = (props) => {
  const { setSelectedPlugins, setIsPluginsPanelVisible } = chatStore;
  const { commandSections } = commandStore;

  const handleTogglePlugin = (plugin: Plugin, value: boolean) => {
    setSelectedPlugins((prev) => {
      if (value) {
        prev.add(plugin);
      } else {
        prev.delete(plugin);
      }

      return new Set(prev);
    });
  };

  const isBrowser = createMemo(
    on(commandSections, () => {
      return !!getBrowserDrivers();
    })
  );

  return (
    <SWrapper>
      <SContentWrapper visible={props.visible}>
        <SHeader>
          <Text.Headline>Plugins</Text.Headline>
          <Button
            onClick={() => setIsPluginsPanelVisible(false)}
            onShortcut={() => undefined}
            shortcutIndex={6}
          >
            Close plugins
          </Button>
        </SHeader>

        <SPluginsWrapper>
          <SPluginTileWrapper>
            <Checkbox
              shortcutKey="0"
              onChange={(event) => {
                handleTogglePlugin(searchPlugin, event.currentTarget.checked);
              }}
              disabled={!isBrowser()}
            />

            <div>
              <Text.Callout color={isBrowser() ? "text" : "gray"}>
                {searchPlugin.name}
              </Text.Callout>
              <Text.Callout color={isBrowser() ? "gray" : "gray2"} mt="2px">
                {searchPlugin.description}
              </Text.Callout>

              <Text.Caption color={isBrowser() ? "gray" : "gray2"} mt="4px">
                <Show when={!isBrowser()}>
                  You need to install Mozilla Firefox or Google Chrome to enable
                  web browsing
                </Show>
                <Show when={isBrowser()}>
                  Lander uses system browsers in a secure sandbox to search and
                  browse the web
                </Show>
              </Text.Caption>
            </div>
          </SPluginTileWrapper>

          <For each={plugins.filter((plugin) => plugin.name !== "Search")}>
            {(plugin, index) => (
              <SPluginTileWrapper>
                <Checkbox
                  shortcutKey={String(index() + 1)}
                  onChange={(event) => {
                    handleTogglePlugin(plugin, event.currentTarget.checked);
                  }}
                />

                <div>
                  <Text.Callout>{plugin.name}</Text.Callout>
                  <Text.Callout color="gray" mt="2px">
                    {plugin.description}
                  </Text.Callout>
                </div>
              </SPluginTileWrapper>
            )}
          </For>
        </SPluginsWrapper>
      </SContentWrapper>
    </SWrapper>
  );
};
