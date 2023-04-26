import { NetworkRequest } from "~/services/network.service";
import { Subscription } from "./subscription.model";

export class User {
  id: number;
  deviceID: string;
  email: string;
  subscription?: Subscription;

  constructor(opts: {
    id: number;
    deviceID: string;
    email: string;
    subscription?: Subscription;
  }) {
    this.id = opts.id;
    this.deviceID = opts.deviceID;
    this.email = opts.email;
    this.subscription = opts.subscription;
  }

  static requests = {
    whoami() {
      return new NetworkRequest("/whoami", "GET");
    },
    anonymous(deviceID: string) {
      const dto = { device_id: deviceID };
      return new NetworkRequest("/accounts/anonymous", "POST", dto);
    },
    sendToken(email: string) {
      const dto = { email };
      return new NetworkRequest("/accounts/send_token", "POST", dto);
    },
    identify(email: string, token: string) {
      const dto = { email, token };
      return new NetworkRequest("/accounts/identify", "POST", dto);
    },
    delete() {
      return new NetworkRequest("/user", "DELETE");
    },
  };
}
