import { StripeElementStyle } from "@stripe/stripe-js";
import { Component, createEffect, createSignal } from "solid-js";
import {
  CardCvc,
  CardExpiry,
  CardNumber,
  useStripe,
  useStripeElements,
} from "solid-stripe";
import { styled } from "solid-styled-components";
import { Button, Text } from "~/components/atoms";
import { getTheme } from "~/components/theme";
import { useUser } from "~/queries";
import { InvokeService } from "~/services";
import { ThemeMode, themeStore } from "~/store";

const SWrapper = styled("div")`
  display: grid;
  grid-template-columns: 50%;
  align-items: center;
  justify-content: center;
`;

const SInputWrapper = styled("div")`
  padding: 12px 16px;
  background: ${(props) => props.theme?.colors.gray5};
  border: 1px solid ${(props) => props.theme?.colors.gray3};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5), 0px 1px 6px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
`;

const SElementsWrapper = styled("div")`
  display: grid;
  gap: 16px;
`;

const SRow = styled("div")`
  display: grid;
  grid-auto-flow: column;
  gap: 16px;
`;

interface Props {
  clientSecret: string;
  onSuccess: () => void;
}

export const SettingsAccountPaymentForm: Component<Props> = (props) => {
  const { themeMode } = themeStore;

  const user = useUser({ enabled: false });

  const stripe = useStripe();
  const elements = useStripeElements();

  const [isLoading, setIsLoading] = createSignal(false);
  const [style, setStyle] = createSignal<StripeElementStyle>();

  const handleSubmit = async () => {
    setIsLoading(true);

    const { error } = await stripe().confirmCardPayment(props.clientSecret, {
      payment_method: { card: elements().getElement("cardNumber")! },
    });

    if (error) {
      setIsLoading(false);
    }

    const prev = user.data;

    let attempts = 0;

    const interval = setInterval(async () => {
      attempts += 1;

      const next = await user.refetch();

      if (
        next.data?.subscription &&
        next.data?.subscription?.card.externalId !==
          prev?.subscription?.card.externalId
      ) {
        props.onSuccess();
        InvokeService.shared.fetchUser();
        clearInterval(interval);
      }

      if (attempts === 10) {
        clearInterval(interval);
      }
    }, 1000);
  };

  createEffect(() => {
    const handleThemeChange = () => {
      const mode =
        themeMode() === ThemeMode.System
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? ThemeMode.Dark
            : ThemeMode.Light
          : themeMode();

      const theme = getTheme(mode);

      setStyle({
        base: {
          color: theme.colors.text,
          fontFamily: theme.fontFamily,
          fontSize: "16px",
          "::placeholder": {
            color: theme.colors.gray,
          },
        },
        invalid: {
          color: theme.colors.orange,
          iconColor: theme.colors.orange,
        },
      });
    };

    handleThemeChange();

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleThemeChange);
  });

  return (
    <SWrapper>
      <Text.Headline my="32px">Add your payment details</Text.Headline>

      <SElementsWrapper>
        <div>
          <Text.Body mb="8px">Card number</Text.Body>
          <SInputWrapper>
            <CardNumber placeholder="1234 1234 1234 1234" style={style()} />
          </SInputWrapper>
        </div>

        <SRow>
          <div>
            <Text.Body mb="8px">Expiration</Text.Body>
            <SInputWrapper>
              <CardExpiry style={style()} />
            </SInputWrapper>
          </div>

          <div>
            <Text.Body mb="8px">CVC</Text.Body>
            <SInputWrapper>
              <CardCvc style={style()} />
            </SInputWrapper>
          </div>
        </SRow>
      </SElementsWrapper>

      <Text.Callout color="gray" mt="24px">
        By providing your card information, you allow Lander to charge your card
        for future payments in accordance with their terms.
      </Text.Callout>

      <Button
        loading={isLoading()}
        onClick={handleSubmit}
        justifySelf="start"
        mt="32px"
      >
        Submit
      </Button>
    </SWrapper>
  );
};
