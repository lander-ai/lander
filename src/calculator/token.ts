import dayjs from "dayjs";
import { calculatorConfig } from "./config";
import {
  CalculatorCityTokenCity,
  CalculatorCountryTokenCountry,
  CalculatorCurrencyTokenCurrency,
  CalculatorDateTokenDate,
  CalculatorDateTokenDateType,
  CalculatorTimezoneTokenTimezone,
  CalculatorTokenType,
  CalculatorUnitTokenUnit,
} from "./types";
import { convert } from "./util";

export class CalculatorToken {
  type: CalculatorTokenType;
  value!: unknown;
  displayDefault = false;

  constructor(type: CalculatorTokenType) {
    this.type = type;
  }

  get formattedValue(): string {
    if (typeof this.value === "number") {
      return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 6,
      }).format(this.value);
    }

    return String(this.value);
  }

  get tag(): string | undefined {
    return undefined;
  }

  add(token: CalculatorToken) {
    if (typeof this.value === "number" && typeof token.value === "number") {
      this.value += token.value;
      token.value = this.value;
    }

    if (token instanceof CalculatorUnitToken) {
      return token;
    }

    return this;
  }

  subtract(token: CalculatorToken) {
    if (typeof this.value === "number" && typeof token.value === "number") {
      this.value -= token.value;
      token.value = this.value;
    }

    if (token instanceof CalculatorUnitToken) {
      return token;
    }

    return this;
  }

  multiply(token: CalculatorToken) {
    if (typeof this.value === "number" && typeof token.value === "number") {
      this.value *= token.value;
      token.value = this.value;
    }

    if (token instanceof CalculatorUnitToken) {
      return token;
    }

    return this;
  }

  divide(token: CalculatorToken) {
    if (typeof this.value === "number" && typeof token.value === "number") {
      this.value /= token.value;
      token.value = this.value;
    }

    if (token instanceof CalculatorUnitToken) {
      return token;
    }

    return this;
  }

  power(token: CalculatorToken) {
    if (typeof this.value === "number" && typeof token.value === "number") {
      this.value **= token.value;
      token.value = this.value;
    }

    if (token instanceof CalculatorUnitToken) {
      return token;
    }

    return this;
  }

  apply(method: (input: number) => number) {
    if (typeof this.value === "number") {
      this.value = method(this.value);
    }

    return this;
  }
}

export class CalculatorNumberToken extends CalculatorToken {
  type = CalculatorTokenType.Number;
  value: number;

  constructor(value: number) {
    super(CalculatorTokenType.Number);
    this.value = value;
  }
}

export class CalculatorOperatorToken extends CalculatorToken {
  type = CalculatorTokenType.Operator;
  value: string;
  method?: (x: number) => number;

  constructor(value: string, method?: (x: number) => number) {
    super(CalculatorTokenType.Operator);
    this.value = value;
    this.method = method;
  }
}

export class CalculatorUnitToken extends CalculatorToken {
  type = CalculatorTokenType.Unit;
  value: number;
  unit: CalculatorUnitTokenUnit;

  constructor(value: number, unit: CalculatorUnitTokenUnit) {
    super(CalculatorTokenType.Unit);
    this.value = value;
    this.unit = unit;
  }

  get formattedValue() {
    const value = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(this.value);

    let symbol = this.unit.symbol;

    if (symbol === "pint" && this.value !== 1) {
      symbol = "pints";
    } else if (symbol === "cup" && this.value !== 1) {
      symbol = "cups";
    } else if (symbol === "minute" && this.value !== 1) {
      symbol = "minutes";
    } else if (symbol === "day" && this.value !== 1) {
      symbol = "days";
    } else if (symbol === "week" && this.value !== 1) {
      symbol = "weeks";
    } else if (symbol === "hour" && this.value !== 1) {
      symbol = "hours";
    } else if (symbol === "month" && this.value !== 1) {
      symbol = "months";
    } else if (symbol === "year" && this.value !== 1) {
      symbol = "years";
    } else if (symbol === "decade" && this.value !== 1) {
      symbol = "decades";
    } else if (symbol === "millennium" && this.value !== 1) {
      symbol = "millennia";
    }

    return `${value} ${symbol}`;
  }

  convert(to: string) {
    return convert(this, to);
  }
}

export class CalculatorDateToken extends CalculatorToken {
  type = CalculatorTokenType.Date;
  value: Date;
  date: CalculatorDateTokenDate;
  displayDefault = true;

  constructor(value: Date, date: CalculatorDateTokenDate) {
    super(CalculatorTokenType.Date);
    this.value = value;
    this.date = date;
  }

  convert(timezone: CalculatorDateTokenDate["timezone"]) {
    if (!timezone) {
      return dayjs(this.value);
    }

    const isLocalTime = !this.date.localTime && !this.date.convertedTime;

    if (typeof timezone === "string") {
      return dayjs(this.value).tz(timezone, isLocalTime);
    }

    return dayjs(this.value)
      .utc(true)
      .utcOffset(timezone.offset * 60, isLocalTime);
  }

  get formattedValue() {
    const date = this.convert(this.date.timezone);

    let result = "";

    if (this.date.type === CalculatorDateTokenDateType.Date) {
      result = date.format("MMM D YYYY");
    }

    if (this.date.type === CalculatorDateTokenDateType.DateTime) {
      result = date.format("MMM D YYYY [at] h:mm:ss a");
    }

    if (this.date.type === CalculatorDateTokenDateType.Time) {
      if (date.second() === 0) {
        result = date.format("h:mm a");
      } else {
        result = date.format("h:mm:ss a");
      }
    }

    if (this.date.timezone) {
      const offset =
        typeof this.date.timezone === "string"
          ? date.utcOffset() / 60
          : this.date.localTime
          ? dayjs().utcOffset() / 60
          : this.date.timezone.offset;

      let timezoneText = "UTC";

      timezoneText +=
        offset !== 0
          ? `${offset > 0 ? "+" : ""}${String(offset).replace(".5", ":30")}`
          : "";

      result = `${result} (${timezoneText})`;
    }

    return result;
  }

  get tag() {
    if (this.date.localTime) {
      return "your time";
    }

    if (typeof this.date.timezone === "object") {
      return this.date.timezone.zone;
    }
  }
}

export class CalculatorCurrencyToken extends CalculatorToken {
  type = CalculatorTokenType.Currency;
  value: number;
  currency: CalculatorCurrencyTokenCurrency;

  constructor(value: number, currency: CalculatorCurrencyTokenCurrency) {
    super(CalculatorTokenType.Currency);
    this.value = value;
    this.currency = currency;
  }

  get formattedValue() {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: this.currency.currencyCode,
    }).format(this.value);
  }

  get tag() {
    return this.currency.currencyCode;
  }
}

export class CalculatorCityToken extends CalculatorToken {
  type = CalculatorTokenType.City;
  value: string;
  city: CalculatorCityTokenCity;
  displayDefault = true;

  constructor(value: string, city: CalculatorCityTokenCity) {
    super(CalculatorTokenType.City);
    this.value = value;
    this.city = city;
  }

  get country() {
    const country =
      calculatorConfig.countries[
        this.city.iso2.toLowerCase() as keyof typeof calculatorConfig.countries
      ];

    return country as CalculatorCountryTokenCountry;
  }

  get formattedValue() {
    return this.city.name;
  }

  get tag() {
    return this.country.name;
  }
}

export class CalculatorCountryToken extends CalculatorToken {
  type = CalculatorTokenType.Country;
  value: string;
  country: CalculatorCountryTokenCountry;
  displayDefault = true;

  constructor(value: string, country: CalculatorCountryTokenCountry) {
    super(CalculatorTokenType.Country);
    this.value = value;
    this.country = country;
  }

  get formattedValue() {
    return this.country.name;
  }

  get tag() {
    return `Population • ${new Intl.NumberFormat().format(
      this.country.population
    )}`;
  }

  get city() {
    const city =
      calculatorConfig.cities[
        this.country.capital.toLowerCase() as keyof typeof calculatorConfig.cities
      ];

    return city as CalculatorCityTokenCity;
  }
}

export class CalculatorTimezoneToken extends CalculatorToken {
  type = CalculatorTokenType.Timezone;
  value: string;
  timezone: CalculatorTimezoneTokenTimezone;

  constructor(value: string, timezone: CalculatorTimezoneTokenTimezone) {
    super(CalculatorTokenType.Timezone);
    this.value = value;
    this.timezone = timezone;
  }
}

export class CalculatorWildcardToken extends CalculatorToken {
  type = CalculatorTokenType.Wildcard;
  value: string;

  constructor(value: string) {
    super(CalculatorTokenType.Wildcard);
    this.value = value;
  }
}
