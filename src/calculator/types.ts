import { CalculatorToken } from "./token";

export enum CalculatorTokenType {
  Number = "number",
  Operator = "operator",
  Unit = "unit",
  Date = "date",
  Currency = "currency",
  Country = "country",
  City = "city",
  Timezone = "timezone",
  Wildcard = "wildcard",
}

export enum CalculatorOperatorTokenValue {
  Add = "add",
  Subtract = "subtract",
  Multiply = "multiply",
  Divide = "divide",
  Power = "power",
  Convert = "convert",
  TimeDifference = "time-difference",
  Method = "method",
}

export enum CalculatorUnitTokenValue {
  Volume = "volume",
  Mass = "mass",
  Length = "length",
  MemoryStorage = "memory",
  Duration = "duration",
  Currency = "currency",
}

export enum CalculatorUnitTokenTimeUnit {
  Nanosecond = "ns",
  Millisecond = "ms",
  Second = "s",
  Minute = "min",
  Hour = "hour",
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
  Decade = "decade",
  Century = "century",
  Millennium = "millennium",
}

export interface CalculatorUnitTokenUnit {
  type: CalculatorUnitTokenValue;
  symbol: string;
  ratio: number;
}

export enum CalculatorDateTokenDateType {
  Date = "date",
  DateTime = "datetime",
  Time = "time",
}

export interface CalculatorDateTokenDate {
  type: CalculatorDateTokenDateType;
  timezone?: string | { offset: number; zone: string };
  localTime?: boolean;
  convertedTime?: boolean;
}

export interface CalculatorCurrencyTokenCurrency {
  currencyCode: string;
  symbol?: string | null;
  name: string;
}

export interface CalculatorCityTokenCity {
  name: string;
  lat: number;
  lng: number;
  population: number;
  iso2: string;
  timezone: string;
}

export interface CalculatorCountryTokenCountry {
  iso2: string;
  name: string;
  currencyCode: string;
  population: number;
  capital: string;
  continent: string;
}

export interface CalculatorTimezoneTokenTimezone {
  zone: string;
  offset: number;
}

export enum CalculatorResultType {
  None = "None",
  Equation = "Equation",
  City = "City",
  Country = "Country",
  Currency = "Currency",
  Date = "Date",
  Number = "Number",
  TimezoneConversion = "Time Zone Conversion",
  UnitConversion = "Unit Conversion",
}

export interface CalculatorResult {
  result: CalculatorToken;
  type: CalculatorResultType;
}
