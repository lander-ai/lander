import { NetworkRequest } from "~/services/network.service";

export enum SubscriptionPlan {
  Core = "core",
}

export enum SubscriptionStatus {
  Active = "active",
  PendingCancellation = "pending_cancellation",
}

export class Subscription {
  id: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycleAnchor: number;
  card: {
    externalId: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    last4: string;
  };

  constructor(opts: {
    id: number;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    billingCycleAnchor: number;
    card: {
      externalId: string;
      brand: string;
      expiryMonth: number;
      expiryYear: number;
      last4: string;
    };
  }) {
    this.id = opts.id;
    this.plan = opts.plan;
    this.status = opts.status;
    this.billingCycleAnchor = opts.billingCycleAnchor;
    this.card = opts.card;
  }

  static requests = {
    setup() {
      return new NetworkRequest("/subscription/setup", "POST");
    },
    cancel() {
      return new NetworkRequest("/subscription/cancel", "POST");
    },
    resume() {
      return new NetworkRequest("/subscription/resume", "POST");
    },
  };
}

export class SetupSubscriptionResponse {
  clientSecret: string;

  constructor(opts: { clientSecret: string }) {
    this.clientSecret = opts.clientSecret;
  }
}
