import { Rerun } from "@solid-primitives/keyed";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Component, createMemo, createSignal, onMount, Show } from "solid-js";
import { Elements } from "solid-stripe";
import { __stripe_pk__ } from "~/constants";
import { SetupSubscriptionResponse, Subscription } from "~/models";
import { NetworkService } from "~/services/network.service";
import { ThemeMode } from "~/store";
import { SettingsAccountPaymentForm } from "./settings-account-payment-form.component";

interface Props {
  clientSecret?: string;
  onSuccess: () => void;
}

export const SettingsAccountPayment: Component<Props> = (props) => {
  const [stripe, setStripe] = createSignal<Stripe>();
  const [subscription, setSubscription] =
    createSignal<SetupSubscriptionResponse>();
  const [themeMode, setThemeMode] = createSignal<ThemeMode>();

  onMount(async () => {
    const stripe = await loadStripe(__stripe_pk__);

    if (stripe) {
      setStripe(stripe);
    }

    if (!props.clientSecret) {
      const { data: subscription } = await NetworkService.shared.load(
        SetupSubscriptionResponse,
        Subscription.requests.setup()
      );

      setSubscription(subscription);
    }
  });

  const clientSecret = createMemo(() => {
    if (!props.clientSecret) {
      return subscription()?.clientSecret;
    }

    return props.clientSecret;
  });

  onMount(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        setThemeMode(
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? ThemeMode.Dark
            : ThemeMode.Light
        );
      });
  });

  return (
    <Show when={clientSecret() && stripe()}>
      <Rerun on={themeMode}>
        <Elements stripe={stripe()} clientSecret={clientSecret()}>
          <SettingsAccountPaymentForm
            clientSecret={clientSecret()!}
            onSuccess={props.onSuccess}
          />
        </Elements>
      </Rerun>
    </Show>
  );
};
