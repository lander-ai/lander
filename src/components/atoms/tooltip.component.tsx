import { batch, Component, createEffect, createSignal, JSX } from "solid-js";
import { styled } from "solid-styled-components";
import { Text } from "./text.component";

const SWrapper = styled("div")``;

interface STooltipProps {
  top: number;
  left: number;
  visible: boolean;
}

const STooltip = styled(Text.Caption)<STooltipProps>`
  position: fixed;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  padding: 8px 12px;
  background: ${(props) => props.theme?.colors.gray5};
  border-radius: 8px;
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
`;

interface Props {
  children: JSX.Element;
  padding?: number;
  message: string;
}

export const Tooltip: Component<Props> = (props) => {
  let contentRef: HTMLDivElement | undefined;
  let tooltipRef: HTMLDivElement | undefined;

  const [isTooltipVisble, setIsTooltipVisible] = createSignal(false);
  const [top, setTop] = createSignal(0);
  const [left, setLeft] = createSignal(0);

  createEffect(() => {
    const contentSize = contentRef?.getBoundingClientRect();
    const tooltipSize = tooltipRef?.getBoundingClientRect();

    if (contentSize && tooltipSize) {
      batch(() => {
        const minTop = 16;

        const idealTop = contentSize.y + (props.padding || 0);

        const maxTop = window.innerHeight - tooltipSize.height - 16;

        setTop(Math.max(Math.min(idealTop, maxTop), minTop));

        const minLeft = 16;

        const idealLeft =
          contentSize.x + contentSize.width / 2 - tooltipSize.width / 2;

        const maxLeft = window.innerWidth - tooltipSize.width - 16;

        setLeft(Math.max(Math.min(idealLeft, maxLeft), minLeft));
      });
    }
  });

  return (
    <SWrapper
      onMouseOver={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      <STooltip
        ref={tooltipRef}
        top={top()}
        left={left()}
        visible={isTooltipVisble()}
      >
        {props.message}
      </STooltip>

      <div ref={contentRef}>{props.children}</div>
    </SWrapper>
  );
};
