import PouchDB from "pouchdb";

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

export class AnalyticsService {
  static shared = new AnalyticsService();

  private db = new PouchDB("analytics");

  private constructor() {}

  async addEvent(data: AddEventPayload) {
    const now = new Date();

    const event = {
      ...data,
      _id: now.toISOString(),
      created_at: now,
    };

    await this.db.put(event);
  }

  async query<EventType extends AnalyticsEventType>(
    type: EventType,
    start: Date,
    end: Date
  ) {
    const response = await this.db.allDocs<AnalyticsEvent<EventType>>({
      include_docs: true,
      startkey: start.toISOString(),
      endkey: end.toISOString(),
    });

    return response.rows
      .map((row) => row.doc)
      .filter((doc) => doc?.type === type) as Array<AnalyticsEvent<EventType>>;
  }

  async aggregateCommandEvents(start: Date, end: Date) {
    const commandEvents = await this.query(
      AnalyticsEventType.Command,
      start,
      end
    );

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
