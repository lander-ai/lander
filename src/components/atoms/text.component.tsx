import { styled } from "solid-styled-components";
import {
  color,
  ColorProps,
  layout,
  LayoutProps,
  space,
  SpaceProps,
  typography,
  TypographyProps,
} from "styled-system";

type StyledProps = SpaceProps & TypographyProps & ColorProps & LayoutProps;

const Base = styled.div<StyledProps>`
  font-weight: ${(props) => props.theme?.fontWeights.regular};
  color: ${(props) => props.theme?.colors.text};
  text-decoration-color: ${(props) => props.theme?.colors.text};

  ${space};
  ${typography};
  ${color};
  ${layout};
`;

const SuperLargeTitle = styled(Base)<StyledProps>`
  font-size: 34px;
`;

const LargeTitle = styled(Base)<StyledProps>`
  font-size: 28px;
`;

const Title = styled(Base)<StyledProps>`
  font-size: 22px;
`;

const Subtitle = styled(Base)<StyledProps>`
  font-size: 20px;
`;

const Headline = styled(Base)<StyledProps>`
  font-size: 18px;
`;

const Subheadline = styled(Base)<StyledProps>`
  font-size: 17px;
`;

const Body = styled(Base)<StyledProps>`
  font-size: 15px;
`;

const Callout = styled(Base)<StyledProps>`
  font-size: 14px;
`;

const Footnote = styled(Base)<StyledProps>`
  font-size: 13px;
`;

const Caption = styled(Base)<StyledProps>`
  font-size: 12.5px;
`;

export const Text = {
  SuperLargeTitle,
  LargeTitle,
  Title,
  Subtitle,
  Headline,
  Subheadline,
  Body,
  Callout,
  Footnote,
  Caption,
};
