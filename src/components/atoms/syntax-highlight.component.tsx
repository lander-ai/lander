import highlight from "highlight.js";
import { Component, createMemo, Show, splitProps } from "solid-js";
import { styled } from "solid-styled-components";
import { space, SpaceProps } from "styled-system";
import { ThemeMode, themeStore } from "~/store";
import { cssTheme } from "~/util";

type StyledProps = SpaceProps;

const SPre = styled("pre")<StyledProps>`
  padding: 0;
  margin: 0;
  user-select: text;
  -webkit-user-select: text;

  ${space};
`;

const SCode = styled("code")<{ themeMode: ThemeMode }>`
  padding: 0;
  margin: 0;
  font-family: "Fira Code";
  font-size: 14px;

  ${(props) => cssTheme(props.themeMode, "color: #adbac7", "color: #24292e")};

  &::selection,
  *::selection {
    background: ${(props) => props.theme?.colors.gray};
  }

  > .hljs-doctag,
  .hljs-keyword,
  .hljs-meta .hljs-keyword,
  .hljs-template-tag,
  .hljs-template-variable,
  .hljs-type,
  .hljs-variable.language_ {
    ${(props) => cssTheme(props.themeMode, "color: #f47067", "color: #d73a49")};
  }

  > .hljs-title,
  .hljs-title.class_,
  .hljs-title.class_.inherited__,
  .hljs-title.function_ {
    ${(props) => cssTheme(props.themeMode, "color: #dcbdfb", "color: #6f42c1")};
  }

  > .hljs-attr,
  .hljs-attribute,
  .hljs-literal,
  .hljs-meta,
  .hljs-number,
  .hljs-operator,
  .hljs-selector-attr,
  .hljs-selector-class,
  .hljs-selector-id,
  .hljs-variable {
    ${(props) => cssTheme(props.themeMode, "color: #6cb6ff", "color: #005cc5")};
  }

  > .hljs-meta .hljs-string,
  .hljs-regexp,
  .hljs-string {
    ${(props) => cssTheme(props.themeMode, "color: #96d0ff", "color: #032f62")};
  }

  > .hljs-built_in,
  .hljs-symbol {
    ${(props) => cssTheme(props.themeMode, "color: #f69d50", "color: #e36209")};
  }

  > .hljs-code,
  .hljs-comment,
  .hljs-formula {
    ${(props) => cssTheme(props.themeMode, "color: #768390", "color: #6a737d")};
  }

  > .hljs-name,
  .hljs-quote,
  .hljs-selector-pseudo,
  .hljs-selector-tag {
    ${(props) => cssTheme(props.themeMode, "color: #8ddb8c", "color: #22863a")};
  }

  > .hljs-subst {
    ${(props) => cssTheme(props.themeMode, "color: #adbac7", "color: #24292e")};
  }

  > .hljs-section {
    font-weight: 700;

    ${(props) => cssTheme(props.themeMode, "color: #316dca", "color: #005cc5")};
  }

  > .hljs-bullet {
    ${(props) => cssTheme(props.themeMode, "color: #eac55f", "color: #735c0f")};
  }

  > .hljs-emphasis {
    font-style: italic;
    ${(props) => cssTheme(props.themeMode, "color: #adbac7", "color: #24292e")};
  }

  > .hljs-strong {
    font-weight: 700;

    ${(props) => cssTheme(props.themeMode, "color: #adbac7", "color: #24292e")};
  }

  > .hljs-addition {
    ${(props) =>
      cssTheme(props.themeMode, "color: #b4f1b4", "background: #22863a")};
    ${(props) =>
      cssTheme(props.themeMode, "color: #1b4721", "background: #f0fff4")};
  }

  > .hljs-deletion {
    ${(props) =>
      cssTheme(props.themeMode, "color: #ffd8d3", "background: #78191b")};
    ${(props) =>
      cssTheme(props.themeMode, "color: #b31d28", "background: #ffeef0")};
  }
`;

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

interface Props extends StyledProps {
  children: string;
  inline?: boolean;
  language?: string;
  ignoreIllegals?: boolean;
}

export const SyntaxHighlight: Component<Props> = ($props) => {
  const { themeMode } = themeStore;

  const [props, rest] = splitProps($props, [
    "children",
    "inline",
    "language",
    "ignoreIllegals",
  ]);

  const highlightedCode = createMemo(() => {
    if (props.inline) {
      return escapeHtml(props.children);
    }

    if (!props.language) {
      const result = highlight.highlightAuto(props.children);
      return result.value;
    }

    const result = highlight.highlight(props.children, {
      language: props.language as string,
      ignoreIllegals: props.ignoreIllegals || true,
    });

    return result.value;
  });

  const codeBlock = (
    // eslint-disable-next-line solid/no-innerhtml
    <SCode themeMode={themeMode()} innerHTML={highlightedCode()} />
  );

  return (
    <Show when={!props.inline} fallback={codeBlock}>
      <SPre {...rest}>{codeBlock}</SPre>
    </Show>
  );
};
