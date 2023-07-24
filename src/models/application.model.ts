import { Exclude } from "class-transformer";
import { __macos__, __windows__ } from "~/constants";
import { InvokeService } from "~/services";
import { Command, CommandType } from "./command.model";

export interface ApplicationData {
  id: string;
  name: string;
  icon: string;
  path: string;
  selectedText?: string;
  focusedText?: string;
}

export class Application implements ApplicationData {
  id: string;
  name: string;
  icon: string;
  path: string;
  selectedText?: string;

  @Exclude()
  focusedText?: string;

  constructor(data: ApplicationData) {
    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon;
    this.path = data.path;
    this.selectedText = data.selectedText;
    this.focusedText = data.focusedText;
  }

  toCommand(type?: CommandType) {
    if (type === CommandType.AI) {
      return new Command({
        type: type,
        id: this.id,
        title: this.name,
        subtitle: this.selectedText,
        icon: this.icon,
        application: this,
        onClick: () => {
          if (__macos__) {
            InvokeService.shared.launchApplication(this.id);
          } else {
            InvokeService.shared.hidePanel();
          }
        },
      });
    }

    return new Command({
      type: CommandType.Application,
      id: this.id,
      title: this.name,
      subtitle: this.selectedText,
      icon: this.icon,
      application: this,
      onClick: () => {
        InvokeService.shared.launchApplication(this.id);
      },
    });
  }
}
