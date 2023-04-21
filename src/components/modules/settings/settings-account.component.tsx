import {
  Component,
  createEffect,
  createSignal,
  Match,
  Show,
  Switch,
} from "solid-js";
import { SetupSubscriptionResponse, Subscription } from "~/models";
import { useUser } from "~/queries";
import { NetworkService } from "~/services/network.service";
import { SettingsAccountDefault } from "./settings-account-default.component";
import { SettingsAccountIdentify } from "./settings-account-identify.component";
import { SettingsAccountPayment } from "./settings-account-payment.component";
import { SettingsAccountProfile } from "./settings-account-profile.component";

enum SettingsAccountView {
  Default,
  Identify,
  Payment,
  Profile,
}

export const SettingsAccount: Component = () => {
  const user = useUser();

  const [view, setView] = createSignal(SettingsAccountView.Default);
  const [clientSecret, setClientSecret] = createSignal<string>();
  const [isClientSecretLoading, setIsClientSecretLoading] = createSignal(false);

  const handleSelectPro = async () => {
    if (!user.data?.email) {
      setView(SettingsAccountView.Identify);
    } else {
      setIsClientSecretLoading(true);
      const { data: subscription } = await NetworkService.shared.load(
        SetupSubscriptionResponse,
        Subscription.requests.setup()
      );
      setClientSecret(subscription.clientSecret);
      setView(SettingsAccountView.Payment);
      setIsClientSecretLoading(false);
    }
  };

  const handleIdentify = (opts?: { clientSecret: string }) => {
    if (!opts?.clientSecret) {
      setView(SettingsAccountView.Profile);
    } else {
      setView(SettingsAccountView.Payment);
      setClientSecret(opts?.clientSecret);
    }
  };

  const handlePayment = (opts?: { clientSecret: string }) => {
    setView(SettingsAccountView.Payment);
    setClientSecret(opts?.clientSecret);
  };

  createEffect(() => {
    if (user.data?.subscription) {
      setView(SettingsAccountView.Profile);
    }
  });

  return (
    <Show when={!user.isLoading}>
      <Switch>
        <Match when={view() === SettingsAccountView.Default}>
          <SettingsAccountDefault
            onSelectPro={handleSelectPro}
            loading={isClientSecretLoading()}
          />
        </Match>
        <Match when={view() === SettingsAccountView.Identify}>
          <SettingsAccountIdentify
            onBack={() => setView(SettingsAccountView.Default)}
            onSuccess={handleIdentify}
          />
        </Match>
        <Match when={view() === SettingsAccountView.Payment}>
          <SettingsAccountPayment
            clientSecret={clientSecret()}
            onSuccess={() => setView(SettingsAccountView.Profile)}
          />
        </Match>
        <Match when={view() === SettingsAccountView.Profile}>
          <SettingsAccountProfile
            onUpdatePayment={handlePayment}
            onUpdateEmail={() => setView(SettingsAccountView.Identify)}
            onDeleteAccount={() => setView(SettingsAccountView.Default)}
          />
        </Match>
      </Switch>
    </Show>
  );
};
