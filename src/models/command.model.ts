import { Exclude } from "class-transformer";
import { AnalyticsService } from "~/services";
import { AnalyticsEventType } from "./analytics-event.model";
import { Application } from "./application.model";

export enum CommandType {
  AI = "ai",
  Application = "application",
  Suggestion = "suggestion",
  Lander = "lander",
}

export class Command {
  type: CommandType;
  id: string;
  title: string;
  icon: string;
  subtitle?: string;
  application?: Application;

  @Exclude()
  searchable = true;

  @Exclude()
  suggestable = true;

  @Exclude()
  onClickMethod: () => void;

  constructor(opts: {
    type: CommandType;
    id: string;
    title: string;
    icon: string;
    subtitle?: string;
    application?: Application;
    searchable?: boolean;
    suggestable?: boolean;
    suggestion?: boolean;
    onClick: () => void;
  }) {
    this.type = opts.type;
    this.id = opts.id;
    this.title = opts.title;
    this.icon = opts.icon;
    this.subtitle = opts.subtitle;
    this.application = opts.application;
    this.searchable = opts.searchable ?? true;
    this.suggestable = opts.suggestable ?? true;
    this.onClickMethod = opts.onClick.bind(this);

    if (opts.suggestion) {
      this.searchable = false;
      this.id = "suggestion-" + this.id;
    }
  }

  onClick() {
    this.onClickMethod();

    AnalyticsService.shared.addEvent({
      type: AnalyticsEventType.Command,
      event: {
        name: "execute",
        command: { id: this.id.replace("suggestion-", ""), name: this.title },
      },
    });
  }
}

export class CommandSection {
  type: CommandType;
  title: string;
  commands: Command[];

  constructor(opts: { type: CommandType; title: string; commands: Command[] }) {
    this.type = opts.type;
    this.title = opts.title;
    this.commands = opts.commands;
  }
}
