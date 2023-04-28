import { relaunch } from "@tauri-apps/api/process";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { Component, createResource, createSignal } from "solid-js";
import { styled } from "solid-styled-components";
import packageJson from "~/../package.json";
import icon from "~/assets/icon.png";
import { Button, Text } from "~/components/atoms";

const SWrapper = styled("div")`
  display: grid;
  justify-content: center;
  margin-top: 40px;
`;

const SCard = styled("div")`
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  gap: 24px;
`;

const SLogo = styled("img")`
  width: 80px;
`;

export const SettingsAbout: Component = () => {
  const [isUpdating, setIsUpdating] = createSignal(false);
  const [update, { refetch }] = createResource(checkUpdate);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await installUpdate();
    await relaunch();
  };

  return (
    <SWrapper>
      <SCard>
        <SLogo src={icon} />

        <div>
          <Text.Title fontWeight="medium">Lander</Text.Title>
          <Text.Body fontWeight="semibold" mt="4px">
            v{packageJson.version}
          </Text.Body>
          <Text.Body
            color={update()?.shouldUpdate ? "orange" : "text"}
            mt="4px"
            fontWeight="medium"
          >
            {update()?.shouldUpdate ? "Update available" : "You are up to date"}
          </Text.Body>
        </div>
      </SCard>

      <div>
        <Button
          mt="24px"
          loading={update.loading || isUpdating()}
          onClick={update()?.shouldUpdate ? handleUpdate : refetch}
        >
          {update()?.shouldUpdate ? "Update" : "Check for updates"}
        </Button>
      </div>
    </SWrapper>
  );
};
