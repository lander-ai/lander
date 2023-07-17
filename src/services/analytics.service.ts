import Dexie, { Table } from "dexie";

export enum AnalyticsEventType {
  Interaction = "interaction",
  Command = "command",
}

interface BaseAnalyticsEventPayload {
  name: string;
}

interface AnalyticsCommandEventPayload {
  command: {
    id: string;
    name: string;
  };
}

type AnalyticsEventPayload<EventType extends AnalyticsEventType> =
  BaseAnalyticsEventPayload &
    (EventType extends AnalyticsEventType.Command
      ? AnalyticsCommandEventPayload
      : never);

export interface AnalyticsEvent<EventType extends AnalyticsEventType> {
  created_at: Date;
  type: EventType;
  event: AnalyticsEventPayload<EventType>;
}

export interface AnalyticsAggregationEvent<EventType extends AnalyticsEventType>
  extends AnalyticsEvent<EventType> {
  count: number;
}

type AddEventPayload = Omit<AnalyticsEvent<AnalyticsEventType>, "created_at">;

class AnalyticsDatabase extends Dexie {
  public event!: Table<AnalyticsEvent<AnalyticsEventType>, number>;

  constructor() {
    super("lander");

    this.version(1).stores({
      event: "id++, created_at, type, event",
    });
  }
}

export class AnalyticsService {
  static shared = new AnalyticsService();

  private db = new AnalyticsDatabase().event;

  async addEvent(data: AddEventPayload) {
    const now = new Date();

    const event = {
      ...data,
      created_at: now,
    };

    await this.db.add(event);
  }

  async aggregateCommandEvents(start: Date, end: Date) {
    const commandEvents = await this.db
      .where("type")
      .equals(AnalyticsEventType.Command)
      .and((event) => event.created_at >= start && event.created_at <= end)
      .toArray();

    const result: Array<AnalyticsAggregationEvent<AnalyticsEventType.Command>> =
      [];

    commandEvents.forEach((commandEvent) => {
      const existingCommandIndex = result.findIndex(
        (c) => c.event.command.id === commandEvent?.event.command.id
      );

      if (existingCommandIndex > -1) {
        result[existingCommandIndex].count += 1;
      } else {
        result.push({
          ...commandEvent,
          count: 0,
        } as AnalyticsAggregationEvent<AnalyticsEventType.Command>);
      }
    });

    return result;
  }
}
