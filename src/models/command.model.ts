import { Application } from "./application.model";

export enum CommandType {
  AI,
  Application,
  Lander,
}

export class Command {
  type: CommandType;
  id: string;
  title: string;
  icon: string;
  subtitle?: string;
  application?: Application;
  searchable = true;
  onClick: () => void;

  constructor(opts: {
    type: CommandType;
    id: string;
    title: string;
    icon: string;
    subtitle?: string;
    application?: Application;
    searchable?: boolean;
    onClick: () => void;
  }) {
    this.type = opts.type;
    this.id = opts.id;
    this.title = opts.title;
    this.icon = opts.icon;
    this.subtitle = opts.subtitle;
    this.application = opts.application;
    this.searchable = opts.searchable || true;
    this.onClick = opts.onClick.bind(this);
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
