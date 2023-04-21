import { Component, createSignal, onMount, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { LoadingIndicator, Text } from "~/components/atoms";

const SWrapper = styled("div")``;

const SInput = styled("input")`
  font-family: ${(props) => props.theme?.fontFamily};
  font-size: 18px;
  color: ${(props) => props.theme?.colors.text};
  background: transparent;
  border: 0.5px solid ${(props) => props.theme?.colors.gray4};
  padding: 8px;
  border-radius: 8px;
  outline: none;

  &::placeholder {
    color: ${(props) => props.theme?.colors.gray};
  }

  &::selection {
    background: ${(props) => props.theme?.colors.gray};
  }
`;

const SInputWrapper = styled("div")`
  display: grid;
  grid-template-columns: 1fr max-content;
  width: 50%;
  align-items: center;
  gap: 16px;
`;

const SNextIconWrapper = styled("div")<{ disabled: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: ${(props) =>
    !props.disabled ? props.theme?.colors.gray4 : props.theme?.colors.gray3};
  display: grid;
  align-content: center;
  justify-content: center;
  border: ${(props) => `0.5px solid ${props.theme?.colors.gray2}`};

  &:hover {
    background: ${(props) => props.theme?.colors.gray3};
  }
`;

interface Props {
  onSubmit: (email: string) => void;
  loading: boolean;
  error?: string;
  email?: string;
}

export const SettingsAccountIdentifyToken: Component<Props> = (props) => {
  const [errorText, setErrorText] = createSignal<string>();

  let tokenInputRef: HTMLInputElement | undefined;

  onMount(() => {
    tokenInputRef?.focus();
  });

  const handleSubmit = () => {
    if (props.loading) {
      return;
    }

    if (tokenInputRef?.value) {
      setErrorText(undefined);
      props.onSubmit(tokenInputRef.value);
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <SWrapper>
      <Text.Headline>Enter your token</Text.Headline>

      <Text.Body color="gray" mt="16px" mb="24px" width="50%">
        We have sent a token to {props.email}. Please enter the token below so
        that we can validate you are the owner of this email address.
      </Text.Body>

      <SInputWrapper>
        <SInput
          placeholder="Token"
          onKeyPress={handleKeyPress}
          ref={tokenInputRef}
        />

        <SNextIconWrapper disabled={props.loading} onClick={handleSubmit}>
          <Show
            when={!props.loading}
            fallback={<LoadingIndicator size="12px" />}
          >
            <Text.Body mb="2px">→</Text.Body>
          </Show>
        </SNextIconWrapper>
      </SInputWrapper>

      <Show when={props.error || errorText()} keyed>
        {(error) => (
          <Text.Body width="50%" mt="8px" color="orange">
            {error}
          </Text.Body>
        )}
      </Show>
    </SWrapper>
  );
};
