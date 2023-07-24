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
