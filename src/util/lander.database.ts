import Dexie, { Table } from "dexie";
import { AnalyticsEvent, AnalyticsEventType, Thread } from "~/models";

export class LanderDatabase extends Dexie {
  static shared = new LanderDatabase();

  public event!: Table<AnalyticsEvent<AnalyticsEventType>, number>;
  public thread!: Table<Omit<Thread, "requests">, string>;

  private constructor() {
    super("lander");

    this.version(1).stores({
      event: "id++, created_at, type, event",
    });

    this.version(2).stores({
      event: "id++, created_at, type, event",
      thread: "id, created_at, type, messages, command",
    });
  }
}
