import { Component, createRoot, createSignal, JSX, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Button } from "./button.component";
import { Text } from "./text.component";

interface PromptStore {
  title: string;
  loading?: boolean;
  body?: string;
  onSuccess: () => void;
  successText?: string;
  onCancel?: () => void;
  cancelText?: string;
}

const store = createRoot(() => {
  const [prompt, setPrompt] = createSignal<PromptStore>();
  return { prompt, setPrompt };
});

const SWrapper = styled("div")`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: grid;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
`;

const SContentWrapper = styled("div")`
  border-radius: 12px;
  padding: 24px;
  background: ${(props) => props.theme?.colors.gray6};
  border: 1px solid ${(props) => props.theme?.colors.gray4};
  max-width: 50%;
`;

const SButtonsWrapper = styled("div")`
  margin-top: 16px;
  display: grid;
  grid-auto-flow: column;
  justify-content: end;
  gap: 8px;
`;

type Props = JSX.HTMLAttributes<HTMLDivElement>;

export const PromptProvider: Component<Props> = (props) => {
  let ref: HTMLDivElement | undefined;

  const { prompt, setPrompt } = store;

  const handleClickOutside = (event: MouseEvent) => {
    if (ref && !ref.contains(event.target as Node)) {
      setPrompt(undefined);
    }
  };

  return (
    <>
      {props.children}
      <Show when={prompt()}>
        <SWrapper onClick={handleClickOutside}>
          <SContentWrapper ref={ref}>
            <Text.Body fontWeight="medium">{prompt()?.title}</Text.Body>
            <Text.Callout mt="16px">{prompt()?.body}</Text.Callout>
            <SButtonsWrapper>
              <Button onClick={() => setPrompt(undefined)}>
                {prompt()?.cancelText ?? "Cancel"}
              </Button>
              <Button
                onClick={() => prompt()?.onSuccess()}
                loading={prompt()?.loading}
              >
                {prompt()?.successText ?? "Submit"}
              </Button>
            </SButtonsWrapper>
          </SContentWrapper>
        </SWrapper>
      </Show>
    </>
  );
};

interface Prompt {
  (opts: PromptStore): void;
  loading: (loading: boolean) => void;
  close: () => void;
}

export const prompt: Prompt = (opts: PromptStore) => {
  store.setPrompt(opts);
};

prompt.loading = (loading: boolean) => {
  store.setPrompt((s) => (s ? { ...s, loading } : undefined));
};

prompt.close = () => {
  store.setPrompt(undefined);
};
