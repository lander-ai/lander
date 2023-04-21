import { Component, createSignal, onMount, Show } from "solid-js";
import { styled } from "solid-styled-components";
import validator from "validator";
import { LoadingIndicator, Text } from "~/components/atoms";
import { useUser } from "~/queries";

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
}

export const SettingsAccountIdentifyEmail: Component<Props> = (props) => {
  const user = useUser({ enabled: false });

  const [errorText, setErrorText] = createSignal<string>();

  let emailInputRef: HTMLInputElement | undefined;

  onMount(() => {
    emailInputRef?.focus();
  });

  const handleSubmit = () => {
    if (props.loading) {
      return;
    }

    if (emailInputRef?.value) {
      if (validator.isEmail(emailInputRef.value)) {
        setErrorText(undefined);
        props.onSubmit(emailInputRef.value);
      } else {
        setErrorText("Please enter a valid email");
      }
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <SWrapper>
      <Text.Headline>
        {user.data?.email ? "Update" : "Connect"} your email
      </Text.Headline>

      <Text.Body color="gray" mt="16px" mb="24px" width="50%">
        We only need your email to link your purchase to your account. Your
        email will never be used for any other reason, such as marketing or
        promotional activities, nor will it be shared with third parties without
        your explicit consent.
      </Text.Body>

      <SInputWrapper>
        <SInput
          type="email"
          placeholder="Email"
          onKeyPress={handleKeyPress}
          ref={emailInputRef}
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
