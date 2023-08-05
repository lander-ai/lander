import { writeText } from "@tauri-apps/api/clipboard";
import { Component, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { CalculatorResult } from "~/calculator/types";
import { Button, Text } from "~/components/atoms";

const SWrapper = styled("div")``;

const SContentWrapper = styled("div")`
  background: ${(props) => props.theme?.colors.gray6};
  border: 1px solid ${(props) => props.theme?.colors.gray5};
  border-radius: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  margin: 16px;
  gap: 16px;
`;

const SSectionWrapper = styled("div")`
  padding: 56px 16px;
  display: grid;
  align-items: center;
  justify-content: center;
`;

const SSectionText = styled(Text.Title)`
  display: -webkit-box;
  white-space: pre-wrap;
  overflow: hidden;
  word-break: break-word;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const SEqualsWrapper = styled("div")`
  display: grid;
  align-items: center;
  justify-content: center;
`;

const STagWrapper = styled("div")`
  height: 0;
  position: relative;
  top: 12px;
  display: grid;
  justify-content: center;
`;

const STagContentWrapper = styled("div")`
  background: ${(props) => props.theme?.colors.gray3};
  width: max-content;
  border-radius: 4px;
  padding: 6px 12px;
`;

interface Props {
  query: string;
  calculation: CalculatorResult;
}

export const CommandCalculationResult: Component<Props> = (props) => {
  const handleCopyResult = async () => {
    await writeText(props.calculation.result.formattedValue);
  };

  return (
    <SWrapper>
      <Text.Callout fontWeight="semibold" mx="12px" mt="16px">
        Calculation
      </Text.Callout>

      <SContentWrapper>
        <SSectionWrapper>
          <SSectionText textAlign="center">{props.query}</SSectionText>
        </SSectionWrapper>

        <SEqualsWrapper>
          <Text.Callout
            color="gray"
            fontWeight="medium"
            textAlign="center"
            mb="12px"
          >
            {props.calculation.type}
          </Text.Callout>
          <Text.Title textAlign="center">→</Text.Title>
          <Button
            onClick={handleCopyResult}
            shortcutIndex={0}
            py="4px"
            mt="12px"
          >
            Copy result
          </Button>
        </SEqualsWrapper>

        <SSectionWrapper>
          <SSectionText textAlign="center">
            {props.calculation.result.formattedValue}
          </SSectionText>

          <Show when={props.calculation.result.tag} keyed>
            {(tag) => (
              <STagWrapper>
                <STagContentWrapper>
                  <Text.Callout textAlign="center">{tag}</Text.Callout>
                </STagContentWrapper>
              </STagWrapper>
            )}
          </Show>
        </SSectionWrapper>
      </SContentWrapper>
    </SWrapper>
  );
};
