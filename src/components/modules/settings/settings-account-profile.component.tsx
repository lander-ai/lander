import dayjs from "dayjs";
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  Show,
} from "solid-js";
import { styled } from "solid-styled-components";
import { Button, prompt, Text } from "~/components/atoms";
import {
  SetupSubscriptionResponse,
  Subscription,
  SubscriptionStatus,
  User,
} from "~/models";
import { useUser } from "~/queries";
import { InvokeService } from "~/services";
import { NetworkService } from "~/services/network.service";

const SWrapper = styled("div")`
  margin: 8px 0;
`;

const SCard = styled("div")`
  padding: 24px;
  background: ${(props) => props.theme?.colors.gray5};
  border-radius: 16px;
  width: 50%;
`;

const SCardIconWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 8px;
`;

const SCardIcon = styled("img")`
  height: 24px;
`;

const SPaymentButtonsWrapper = styled("div")`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 8px;
  margin-top: 16px;
`;

interface Props {
  onUpdatePayment: (opts: { clientSecret: string }) => void;
  onUpdateEmail: () => void;
  onDeleteAccount: () => void;
}

export const SettingsAccountProfile: Component<Props> = (props) => {
  const user = useUser();

  const [cardIcon, setCardIcon] = createSignal<string>();
  const [isUpdatePaymentLoading, setIsUpdatePaymentLoading] =
    createSignal(false);

  createEffect(() => {
    (async () => {
      const cardBrand = user.data?.subscription?.card.brand;
      if (cardBrand) {
        const icon = await import(`../../../assets/cards/${cardBrand}.webp`);
        setCardIcon(icon.default);
      }
    })();
  });

  const handleUpdatePayment = async () => {
    setIsUpdatePaymentLoading(true);
    const { data: subscription } = await NetworkService.shared.load(
      SetupSubscriptionResponse,
      Subscription.requests.setup()
    );
    props.onUpdatePayment({ clientSecret: subscription.clientSecret });
    setIsUpdatePaymentLoading(false);
  };

  const renewalDate = createMemo(() => {
    return dayjs(
      (user.data?.subscription?.billingCycleAnchor || 0) * 1000
    ).format("MMM D YYYY");
  });

  return (
    <Show when={user.data?.subscription?.card} keyed>
      {(card) => (
        <SWrapper>
          <Text.Headline mb="24px">Account</Text.Headline>

          <Text.Subheadline mb="16px" fontWeight="medium">
            Payment details
          </Text.Subheadline>

          <SCard>
            <Text.Callout
              fontWeight="medium"
              mb="8px"
              color={
                user.data?.subscription?.status === SubscriptionStatus.Active
                  ? "gray"
                  : "orange"
              }
            >
              Your subscription{" "}
              {user.data?.subscription?.status === SubscriptionStatus.Active
                ? "renews"
                : "will be cancelled"}{" "}
              on {renewalDate()}
            </Text.Callout>

            <Show when={cardIcon()} keyed>
              {(cardIcon) => (
                <SCardIconWrapper>
                  <SCardIcon src={cardIcon} />
                  <Text.Callout color="gray">••••{card.last4}</Text.Callout>
                </SCardIconWrapper>
              )}
            </Show>

            <Text.Callout mt="8px" color="gray">
              Expires {String(card.expiryMonth).padStart(2, "0")}/
              {String(card.expiryYear).slice(2)}
            </Text.Callout>

            <SPaymentButtonsWrapper>
              <Show
                when={
                  user.data?.subscription?.status === SubscriptionStatus.Active
                }
              >
                <Button
                  onClick={handleUpdatePayment}
                  loading={isUpdatePaymentLoading()}
                >
                  Update
                </Button>
              </Show>

              <Show
                when={
                  user.data?.subscription?.status === SubscriptionStatus.Active
                }
              >
                <Button
                  onClick={() =>
                    prompt({
                      title:
                        "Are you sure you want to cancel your subscription?",
                      body: `Your subscription will be active until ${renewalDate()}. After this date, you account will be downgraded to Core.`,
                      successText: "Cancel",
                      cancelText: "Back",
                      async onSuccess() {
                        prompt.loading(true);
                        await NetworkService.shared.load(
                          Subscription.requests.cancel()
                        );
                        InvokeService.shared.fetchUser();
                        await user.refetch();
                        prompt.loading(false);
                        prompt.close();
                      },
                    })
                  }
                >
                  Cancel
                </Button>
              </Show>

              <Show
                when={
                  user.data?.subscription?.status ===
                  SubscriptionStatus.PendingCancellation
                }
              >
                <Button
                  onClick={() =>
                    prompt({
                      title:
                        "Are you sure you want to resume your subscription?",
                      body: `You will be billed for your subscription on ${renewalDate()}. After this date, your subcription will continue as normal.`,
                      successText: "Resume",
                      cancelText: "Back",
                      async onSuccess() {
                        prompt.loading(true);
                        await NetworkService.shared.load(
                          Subscription.requests.resume()
                        );
                        InvokeService.shared.fetchUser();
                        await user.refetch();
                        prompt.loading(false);
                        prompt.close();
                      },
                    })
                  }
                >
                  Resume
                </Button>
              </Show>
            </SPaymentButtonsWrapper>
          </SCard>

          <Text.Subheadline mt="24px" mb="16px">
            Email
          </Text.Subheadline>

          <SCard>
            <Text.Callout color="gray">{user.data?.email}</Text.Callout>
            <Button mt="16px" onClick={props.onUpdateEmail}>
              Update
            </Button>
          </SCard>

          <Text.Subheadline mt="24px" mb="16px">
            Manage
          </Text.Subheadline>
          <Button
            mt="16px"
            onClick={() =>
              prompt({
                title: "Are you sure you want to delete your account?",
                body: "Your account and subscription will be terminated immediately. You can create a new account at any time.",
                successText: "Delete account",
                async onSuccess() {
                  prompt.loading(true);

                  await NetworkService.shared.load(User.requests.delete());

                  const deviceID = localStorage.getItem("device_id");
                  await NetworkService.shared.load(
                    User.requests.anonymous(deviceID!)
                  );

                  InvokeService.shared.fetchUser();
                  await user.refetch();

                  props.onDeleteAccount();

                  prompt.loading(false);
                  prompt.close();
                },
              })
            }
          >
            Delete account
          </Button>
        </SWrapper>
      )}
    </Show>
  );
};
