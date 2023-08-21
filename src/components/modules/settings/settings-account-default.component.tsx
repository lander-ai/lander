import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { space, SpaceProps } from "styled-system";
import { Button, Text } from "~/components/atoms";

const SWrapper = styled("div")`
  margin: 0 80px;
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  justify-content: center;
`;

const SCard = styled("div")`
  display: grid;
  grid-template-rows: 1fr auto;
  height: -webkit-fill-available;
  padding: 24px;
  box-sizing: border-box;
  border: 0.5px solid ${(props) => props.theme?.colors.gray4};
  border-radius: 16px;
  background: ${(props) => props.theme?.colors.gray6};
`;

const SLine = styled("div")<SpaceProps>`
  width: 100%;
  height: 0.5px;
  background: ${(props) => props.theme?.colors.gray4};

  ${space};
`;

interface Props {
  onSelectPro: () => void;
  loading?: boolean;
}

export const SettingsAccountDefault: Component<Props> = (props) => {
  return (
    <SWrapper>
      <SCard>
        <div>
          <Text.Title>Core</Text.Title>

          <Text.Subheadline mt="16px">⌘ Easy to use</Text.Subheadline>

          <SLine mt="24px" />

          <Text.Body mt="16px" color="gray">
            ✓ Free forever
          </Text.Body>
          <Text.Body mt="8px" color="gray">
            ✓ App Launcher
          </Text.Body>
          <Text.Body mt="8px" color="gray">
            ✓ Smart Calculator
          </Text.Body>
          <Text.Body mt="8px" color="gray">
            ✓ AI Commands
          </Text.Body>
          <Text.Body mt="8px" color="gray">
            ✓ AI Chat (up to 25 messages a day)
          </Text.Body>
        </div>

        <div>
          <Text.Headline mt="40px">Free</Text.Headline>

          <Button mt="12px" onClick={() => undefined} selected>
            Selected
          </Button>
        </div>
      </SCard>

      <SCard>
        <div>
          <Text.Title color="gray">Open</Text.Title>

          <Text.Subheadline mt="16px" color="gray">
            ⌘ Total control
          </Text.Subheadline>

          <SLine mt="24px" />

          <Text.Body mt="16px" color="gray">
            Everything in Core, plus...
          </Text.Body>
          <Text.Body mt="16px" color="gray">
            ✓ Self hosted AI models
          </Text.Body>
          <Text.Body mt="8px" color="gray">
            ✓ Privacy, freedom, control
          </Text.Body>
        </div>

        <div>
          <Text.Headline color="gray" mt="40px">
            Free
          </Text.Headline>

          <Button mt="12px" disabled onClick={() => undefined}>
            Coming soon
          </Button>
        </div>
      </SCard>

      <SCard>
        <div>
          <Text.Title>Pro</Text.Title>

          <Text.Subheadline mt="16px">⌘ Max power</Text.Subheadline>

          <SLine mt="24px" />

          <Text.Body mt="16px" color="gray">
            Everything in Core, plus...
          </Text.Body>
          <Text.Body mt="16px" color="gray">
            ✓ Unlimited chat
          </Text.Body>
          <Text.Body mt="8px" color="gray">
            ✓ Access to latest AI models
          </Text.Body>
          <Text.Body mt="8px" color="gray">
            ✓ Plugins (up to 50 messages a day)
          </Text.Body>
        </div>

        <div>
          <Text.Headline mt="40px">$10/month</Text.Headline>

          <Button mt="12px" onClick={props.onSelectPro} loading={props.loading}>
            Select
          </Button>
        </div>
      </SCard>
    </SWrapper>
  );
};
