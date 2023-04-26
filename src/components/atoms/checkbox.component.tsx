import { styled } from "solid-styled-components";

export const Checkbox = styled("input")`
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  box-sizing: border-box;
  font: inherit;
  color: ${(props) => props.theme?.colors.gray};
  width: 22px;
  height: 22px;
  border: 1px solid ${(props) => props.theme?.colors.gray};
  border-radius: 4px;
  transform: translateY(-0.075em);
  display: grid;
  place-content: center;

  &:before {
    content: "";
    width: 14px;
    height: 14px;
    clip-path: polygon(
      17.67% 58.69%,
      10.25% 71.89%,
      54.09% 96.54%,
      96.87% 20.46%,
      84.35% 13.42%,
      48.99% 76.3%
    );
    transform: scale(0);
    transform-origin: center;
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em var(--form-control-color);
    background-color: ${(props) => props.theme?.colors.text};
  }

  &:checked::before {
    transform: scale(1);
  }

  &:focus {
    outline: max(2px, 0.15em) solid currentColor;
    outline-offset: max(2px, 0.15em);
  }

  &:hover {
    background: ${(props) => props.theme?.colors.gray2};
  }
`;
