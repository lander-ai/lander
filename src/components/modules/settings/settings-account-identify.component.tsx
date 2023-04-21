import {
  batch,
  Component,
  createEffect,
  createSignal,
  Match,
  onCleanup,
  onMount,
  Switch,
} from "solid-js";
import { styled } from "solid-styled-components";
import { Button } from "~/components/atoms";
import { SetupSubscriptionResponse, Subscription, User } from "~/models";
import { useUser } from "~/queries";
import { HTTPError, NetworkService } from "~/services/network.service";
import { SettingsAccountIdentifyEmail } from "./settings-account-identify-email.component";
import { SettingsAccountIdentifyToken } from "./settings-account-identify-token.component";

const SWrapper = styled("div")``;

enum View {
  Email,
  Token,
}

interface Props {
  onBack: () => void;
  onSuccess: (opts?: { clientSecret: string }) => void;
}

export const SettingsAccountIdentify: Component<Props> = (props) => {
  const user = useUser({ enabled: false });

  const [view, setView] = createSignal(View.Email);
  const [isLoading, setIsLoading] = createSignal(false);
  const [emailErrorText, setEmailErrorText] = createSignal<string>();
  const [tokenErrorText, setTokenErrorText] = createSignal<string>();
  const [email, setEmail] = createSignal<string>();

  let emailInputRef: HTMLInputElement | undefined;

  onMount(() => {
    emailInputRef?.focus();
  });

  const handleSubmitEmail = async (email: string) => {
    setIsLoading(true);
    setEmailErrorText(undefined);

    try {
      await NetworkService.shared.load(User.requests.sendToken(email));
      batch(() => {
        setView(View.Token);
        setEmail(email);
      });
    } catch {
      setEmailErrorText("Oops, something went wrong. Please try again later.");
    }

    setIsLoading(false);
  };

  const handleSubmitToken = async (token: string) => {
    setIsLoading(true);
    setTokenErrorText(undefined);

    try {
      const { response } = await NetworkService.shared.load(
        User,
        User.requests.identify(email()!, token)
      );

      if (response.status === 201) {
        const { data: subscription } = await NetworkService.shared.load(
          SetupSubscriptionResponse,
          Subscription.requests.setup()
        );
        props.onSuccess({ clientSecret: subscription.clientSecret });
      } else {
        await user.refetch();
        props.onSuccess();
      }
    } catch (error) {
      if (error instanceof HTTPError && error.status === 403) {
        setTokenErrorText(
          "Sorry, the token you've entered is not valid. Please check that it matches the value in your email."
        );
      } else {
        setTokenErrorText(
          "Oops, something went wrong. Please try again later."
        );
      }
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    if (view() === View.Email) {
      props.onBack();
    } else {
      setView(View.Email);
    }
  };

  createEffect(() => {
    const handeKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleBack();
      }
    };

    window.addEventListener("keydown", handeKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handeKeyDown);
    });
  });

  return (
    <SWrapper>
      <Button onClick={handleBack} mb="24px">
        Back
      </Button>

      <Switch>
        <Match when={view() === View.Email}>
          <SettingsAccountIdentifyEmail
            onSubmit={handleSubmitEmail}
            loading={isLoading()}
            error={emailErrorText()}
          />
        </Match>
        <Match when={view() === View.Token}>
          <SettingsAccountIdentifyToken
            onSubmit={handleSubmitToken}
            loading={isLoading()}
            error={tokenErrorText()}
            email={email()}
          />
        </Match>
      </Switch>
    </SWrapper>
  );
};
