import { emit, listen } from "@tauri-apps/api/event";
import { Application, ApplicationData } from "~/models";

interface EventServiceListener {
  unsubscribe: () => void;
}

export enum EventKey {
  InstalledApplications = "get_installed_applications",
  FetchUser = "fetch_user",
}

type InstalledApplicationsEventArgs = [Application[]];

type EventCallbackArgs<EventKey> =
  EventKey extends EventKey.InstalledApplications
    ? InstalledApplicationsEventArgs
    : never;

export class EventService<EventKey> {
  event: EventKey;
  callback: (...args: EventCallbackArgs<EventKey>) => void;
  private listener?: EventServiceListener;

  constructor(
    event: EventKey,
    callback: (...args: EventCallbackArgs<EventKey>) => void
  ) {
    this.event = event;
    this.callback = callback.bind(this);
    this.listen();
  }

  async emit() {
    emit(`${this.event}_request`);
  }

  async listen() {
    const unsubscribe = await listen(
      `${this.event}_response`,
      async (event) => {
        if (this.event === EventKey.InstalledApplications) {
          const applicationData = JSON.parse(
            event.payload as string
          ) as ApplicationData[];

          const applications = applicationData.map(
            (data) => new Application(data)
          );

          const callback = this.callback as (
            ...args: EventCallbackArgs<EventKey.InstalledApplications>
          ) => void;

          callback(applications);
        }
      }
    );

    this.listener = { unsubscribe };
  }

  async unsubscribe() {
    this.listener?.unsubscribe();
  }
}
