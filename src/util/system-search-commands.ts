import { open } from "@tauri-apps/api/shell";
import duckDuckGoLogo from "~/assets/external-logos/duckduckgo-logo.png";
import googleLogo from "~/assets/external-logos/google-logo.png";
import { Command, CommandType } from "~/models";

export const searchDuckDuckGoCommand = (input: string) =>
  new Command({
    id: "external-search-duckduckgo",
    type: CommandType.Search,
    title: "Search via DuckDuckGo",
    subtitle: input,
    icon: duckDuckGoLogo,
    onClick() {
      open(`https://duckduckgo.com/?q=${this.subtitle}`);
    },
  });

export const searchGoogleCommand = (input: string) =>
  new Command({
    id: "external-search-google",
    type: CommandType.Search,
    title: "Search via Google",
    subtitle: input,
    icon: googleLogo,
    onClick() {
      open(`https://google.com/search?q=${this.subtitle}`);
    },
  });

export const getSystemSearchCommands = (input: string) => {
  return [searchDuckDuckGoCommand(input), searchGoogleCommand(input)];
};
