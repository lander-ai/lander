import { NetworkRequest } from "~/services/network.service";

export interface CurrencyRate {
  code: string;
  rate: number;
}

export class CurrencyRates {
  data: CurrencyRate[];

  constructor(opts: { data: CurrencyRate[] }) {
    this.data = opts.data;
  }

  static requests = {
    rates: new NetworkRequest("/currency/rates", "GET"),
  };
}
