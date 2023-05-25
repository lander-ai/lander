export enum MessageSectionType {
  Text,
  Code,
  InlineCode,
}

export interface MessageSection {
  type: MessageSectionType;
  content: string;
  code?: {
    language?: string;
  };
  tools?: string[];
}

export const parseMessage = (message: string): MessageSection[] => {
  const sections: MessageSection[] = [];

  let token = "";

  message.split("").forEach((char, index) => {
    token += char;

    if (token.includes("```") && token.length > 3) {
      if (token.startsWith("```") && token.endsWith("```")) {
        const language = token.match(/```(.*?)\s/)?.[1].trim();

        sections.push({
          type: MessageSectionType.Code,
          content: token
            .replace(/```/g, "")
            .replace(language ?? "", "")
            .trim(),
          code: { language },
        });

        token = "";
      } else if (token.endsWith("```")) {
        if (token.replace("```", "")) {
          sections.push({
            type: MessageSectionType.Text,
            content: token.replace("```", "").trim(),
          });
        }

        token = "```";
      }
    } else if (
      token.split("").filter((c) => c === "`").length === 2 &&
      !token.includes("``") &&
      token.endsWith("`")
    ) {
      sections.push({
        type: MessageSectionType.Text,
        content: token.split("`")[0].trim(),
      });

      sections.push({
        type: MessageSectionType.InlineCode,
        content: ` ${token.split("`")[1].trim()} `,
      });

      token = "";
    }

    if (token && index === message.length - 1) {
      const [text, code] = token.split("```");

      if (text.trim()) {
        sections.push({
          type: MessageSectionType.Text,
          content: text.trim(),
        });
      }

      if (code?.trim()) {
        const language = token.match(/```(.*?)\s/)?.[1].trim();

        sections.push({
          type: MessageSectionType.Code,
          content: code.replace(language ?? "", "").trim(),
          code: { language },
        });
      }
    }
  });

  return sections;
};
