import { Plugin } from "~/cortex/plugin";
import { InvokeService } from "~/services";
import { getBrowserDrivers } from "~/util/browser";

export class SearchPlugin implements Plugin {
  name = "Search";

  description = "Searches the web";

  modelDescription =
    "Useful for when you need to answer questions about current events. Input must be a search query.";

  async call(input: string) {
    try {
      const driver = getBrowserDrivers()?.[0];

      if (!driver) {
        throw new Error("no browser drivers available");
      }

      const result = await InvokeService.shared.googleSearch(input, driver);
      return result;
    } catch {
      return "No search results";
    }
  }
}
