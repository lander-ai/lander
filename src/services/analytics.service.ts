import { AnalyticsEvent, AnalyticsEventType } from "~/models";
import { LanderDatabase } from "~/util/lander.database";

export interface AnalyticsAggregationEvent<EventType extends AnalyticsEventType>
  extends AnalyticsEvent<EventType> {
  count: number;
}

type AddEventPayload = Omit<AnalyticsEvent<AnalyticsEventType>, "created_at">;

export class AnalyticsService {
  static shared = new AnalyticsService();

  private db = LanderDatabase.shared.event;

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
