import dayjs, { ManipulateType } from "dayjs";
import { CurrencyRate, CurrencyRates } from "~/models";
import { NetworkService } from "~/services/network.service";
import { calculatorConfig as config } from "./config";
import {
  CalculatorCityToken,
  CalculatorCountryToken,
  CalculatorCurrencyToken,
  CalculatorDateToken,
  CalculatorNumberToken,
  CalculatorOperatorToken,
  CalculatorTimezoneToken,
  CalculatorToken,
  CalculatorUnitToken,
  CalculatorWildcardToken,
} from "./token";
import {
  CalculatorDateTokenDateType,
  CalculatorOperatorTokenValue,
  CalculatorResult,
  CalculatorResultType,
  CalculatorTokenType,
} from "./types";

const bracketsRegex = /\((.*?)\)/;
const timeRegex =
  /((\d{1,2}:\d{2}:\d{2}(am|pm)?)|(\d{1,2}:\d{2}(am|pm)?)|(\d{1,2}(am|pm)))/;
const dateRegex =
  /((\d{1,2}(\/|-)\d{1,2}(\/|-)\d{2,4})|([1|2]\d{3}(\/|-)[0|1]\d(\/|-)[0|1]\d))/;
const alphaRegex = /([a-z]+)/;
const numberRegex = /([\d|.|,]+)/;
const operatorRegex = /(\^|\*\*|\+|-|\/|\*)/;
const wildcardRegex = /([^\w\s.()]+)/;
const regexWithoutBrackets = new RegExp(
  `${timeRegex.source}|${dateRegex.source}|${alphaRegex.source}|${numberRegex.source}|${operatorRegex.source}|${wildcardRegex.source}`,
  "g"
);
const regex = new RegExp(
  `${bracketsRegex.source}|${regexWithoutBrackets.source}`,
  "g"
);

const lessThanHourUnits = ["fs", "ps", "ns", "μs", "ms", "s", "minute", "hour"];

class Calculator {
  private currencyData: Record<string, CurrencyRate> = {};

  private tokenize(input: string): CalculatorToken | CalculatorToken[] {
    if (bracketsRegex.test(input)) {
      return this.calculate(input.match(/\((.*)\)/)![1]).tokens;
    }

    if (dateRegex.test(input)) {
      return new CalculatorDateToken(
        dayjs(input).locale(navigator.language).toDate(),
        {
          type: CalculatorDateTokenDateType.Date,
        }
      );
    }

    if (timeRegex.test(input)) {
      const [_input, hours, minutes, seconds, meridiem] =
        input.match(/(\d{1,2}):?(\d{2})?:?(\d{2})?(am|pm)?/i) || [];

      let parsedHours = Number(hours);

      if (parsedHours === 12 && meridiem === "am") {
        parsedHours -= 12;
      } else if (parsedHours < 12 && meridiem === "pm") {
        parsedHours += 12;
      }

      const date = dayjs()
        .set("hour", Number(parsedHours ?? 0))
        .set("minute", Number(minutes ?? 0))
        .set("second", Number(seconds ?? 0))
        .toDate();

      return new CalculatorDateToken(date, {
        type: CalculatorDateTokenDateType.Time,
      });
    }

    if (numberRegex.test(input)) {
      const number = input.replace(",", "");
      if (!Number.isNaN(number)) {
        return new CalculatorNumberToken(Number(number));
      }
    }

    if (operatorRegex.test(input)) {
      const value =
        input in config.operators
          ? config.operators[input as keyof typeof config.operators]
          : undefined;

      if (value) {
        return new CalculatorOperatorToken(value.type);
      }
    }

    const numberValue =
      input in config.numbers
        ? config.numbers[input as keyof typeof config.numbers]
        : undefined;

    if (numberValue) {
      const numberToken = new CalculatorNumberToken(numberValue);
      numberToken.displayDefault = true;
      return numberToken;
    }

    const operatorValue =
      input in config.operators
        ? config.operators[input as keyof typeof config.operators]
        : undefined;

    if (operatorValue) {
      const method =
        "method" in operatorValue ? operatorValue.method : undefined;
      return new CalculatorOperatorToken(operatorValue.type, method);
    }

    const dateValue =
      input in config.dates
        ? config.dates[input as keyof typeof config.dates]()
        : undefined;

    if (dateValue) {
      return new CalculatorDateToken(dateValue, {
        type: CalculatorDateTokenDateType.Date,
      });
    }

    const unitValue =
      input in config.units
        ? config.units[input as keyof typeof config.units]
        : undefined;

    if (unitValue) {
      return new CalculatorUnitToken(1, unitValue);
    }

    const cityValue =
      input in config.cities
        ? config.cities[input as keyof typeof config.cities]
        : undefined;

    if (cityValue) {
      return new CalculatorCityToken(cityValue.name, cityValue);
    }

    const countryValue =
      input in config.countries
        ? config.countries[input as keyof typeof config.countries]
        : undefined;

    if (countryValue) {
      const token = new CalculatorCountryToken(countryValue.name, countryValue);
      token.displayDefault = input.length > 2;

      return token;
    }

    const timezoneValue =
      input in config.timezones
        ? config.timezones[input as keyof typeof config.timezones]
        : undefined;

    if (timezoneValue) {
      return new CalculatorTimezoneToken(timezoneValue.zone, timezoneValue);
    }

    const currencyValue =
      input in config.currencies
        ? config.currencies[input as keyof typeof config.currencies]
        : undefined;

    if (currencyValue) {
      return new CalculatorCurrencyToken(1, currencyValue);
    }

    return new CalculatorWildcardToken(input);
  }

  private parse(input: string): CalculatorToken[] {
    const tokens = input
      .replace(
        new RegExp(
          `(\\d)(${Object.keys(config.numbers).join("|")})(?=([^a-z]|$))`,
          "g"
        ),
        "$1*$2"
      )
      .replace(/(\d)\s(am|pm)/g, "$1$2")
      .replace(/(\d)(?=\()|\)(?=\d|\()/g, "$1)*")
      .match(regex)
      ?.flatMap((input) => {
        const token = this.tokenize(input);

        if (Array.isArray(token)) {
          return token.flatMap((token) => ({ token, input }));
        }

        return { token, input };
      });

    if (!tokens) {
      return [];
    }

    const combinedTokens: CalculatorToken[] = [];

    const tokensLength = tokens.length;

    for (let i = 0; i < tokensLength; i++) {
      let token: CalculatorToken | CalculatorToken[] = tokens[i]?.token;

      if (token && typeof token.value === "string") {
        for (let j = tokens.length; j > i; j--) {
          const nextTokens = tokens.slice(i, j);

          if (
            nextTokens.every(
              ({ token }) =>
                typeof token.value === "string" ||
                token instanceof CalculatorUnitToken
            )
          ) {
            const input = nextTokens.map(({ input }) => input).join(" ");

            const nextToken = this.tokenize(input);

            if (!(nextToken instanceof CalculatorWildcardToken)) {
              token = nextToken;

              tokens.splice(
                i,
                j - i,
                ...(Array.isArray(token)
                  ? token.map((token) => ({ token, input }))
                  : [{ token, input }])
              );

              break;
            }
          }
        }
      }

      if (token) {
        if (token instanceof CalculatorWildcardToken) {
          return [];
        }

        combinedTokens.push(...(Array.isArray(token) ? token : [token]));
      }
    }

    return combinedTokens;
  }

  private calculate(input: string) {
    const tokens = this.parse(input);

    const inputTokens = [...tokens];

    let lastTokenLength = -1;

    while (tokens.length > 1 && lastTokenLength !== tokens.length) {
      lastTokenLength = tokens.length;

      for (let index = 0; index <= tokens.length; index++) {
        const token: CalculatorToken | undefined = tokens[index];
        let prevToken: CalculatorToken | undefined = tokens[index - 1];
        const nextToken: CalculatorToken | undefined = tokens[index + 1];

        if (!token) {
          continue;
        }

        if (prevToken instanceof CalculatorDateToken) {
          if (
            token instanceof CalculatorCityToken ||
            token instanceof CalculatorCountryToken ||
            token instanceof CalculatorTimezoneToken
          ) {
            tokens.splice(
              index - 1,
              2,
              new CalculatorDateToken(prevToken.value, {
                type: prevToken.date.type,
                timezone:
                  token instanceof CalculatorTimezoneToken
                    ? token.timezone
                    : token.city.timezone,
              })
            );
            continue;
          }
        }

        if (token instanceof CalculatorCurrencyToken) {
          if (prevToken instanceof CalculatorNumberToken) {
            tokens.splice(
              index - 1,
              2,
              new CalculatorCurrencyToken(prevToken.value, token.currency)
            );
            continue;
          } else if (nextToken instanceof CalculatorNumberToken) {
            tokens.splice(
              index,
              2,
              new CalculatorCurrencyToken(nextToken.value, token.currency)
            );
            continue;
          }
        }

        if (
          prevToken instanceof CalculatorNumberToken &&
          token instanceof CalculatorUnitToken
        ) {
          tokens.splice(
            index - 1,
            2,
            new CalculatorUnitToken(prevToken.value, token.unit)
          );
          continue;
        }

        const isUnits = tokens.some(
          (token, index) =>
            token instanceof CalculatorUnitToken &&
            tokens[index - 1] instanceof CalculatorNumberToken
        );

        let result: CalculatorToken | undefined = undefined;

        if (!isUnits && token instanceof CalculatorOperatorToken) {
          if (
            token instanceof CalculatorOperatorToken &&
            token.method &&
            typeof nextToken?.value === "number"
          ) {
            result = nextToken.apply(token.method);
          } else if (
            prevToken &&
            prevToken instanceof CalculatorCurrencyToken &&
            token.value === CalculatorOperatorTokenValue.Convert &&
            nextToken instanceof CalculatorCurrencyToken
          ) {
            const prevRate =
              this.currencyData[prevToken.currency.currencyCode]?.rate;

            const nextRate =
              this.currencyData[nextToken.currency.currencyCode]?.rate;

            if (prevRate && nextRate) {
              const value = prevToken.value * prevRate * (1 / nextRate);

              result = new CalculatorCurrencyToken(value, nextToken.currency);
            }
          } else if (
            prevToken &&
            prevToken instanceof CalculatorUnitToken &&
            token.value === CalculatorOperatorTokenValue.TimeDifference &&
            nextToken?.value instanceof Date
          ) {
            result = new CalculatorUnitToken(
              Math.abs(
                dayjs()
                  .startOf("day")
                  .diff(
                    nextToken.value as Date,
                    prevToken.unit.symbol as ManipulateType
                  )
              ),
              prevToken.unit
            );
          } else if (
            prevToken instanceof CalculatorDateToken &&
            token.value === CalculatorOperatorTokenValue.Convert &&
            (nextToken instanceof CalculatorCityToken ||
              nextToken instanceof CalculatorCountryToken ||
              nextToken instanceof CalculatorTimezoneToken)
          ) {
            prevToken.date.convertedTime = false;
            prevToken.date.localTime = false;
            const date = prevToken.convert(prevToken.date.timezone).toDate();

            result = new CalculatorDateToken(date, {
              type:
                prevToken.date.type === CalculatorDateTokenDateType.Time
                  ? CalculatorDateTokenDateType.Time
                  : CalculatorDateTokenDateType.DateTime,
              timezone:
                "city" in nextToken
                  ? nextToken.city.timezone
                  : nextToken.timezone,
              localTime: "city" in nextToken && !prevToken.date.timezone,
              convertedTime:
                "timezone" in nextToken || !!prevToken.date.timezone,
            });
          } else if (
            typeof prevToken?.value === "number" &&
            typeof nextToken?.value === "number"
          ) {
            if (
              token.value !== CalculatorOperatorTokenValue.Convert &&
              prevToken instanceof CalculatorUnitToken &&
              nextToken instanceof CalculatorUnitToken
            ) {
              try {
                prevToken = prevToken.convert(nextToken.unit.symbol);
              } catch {
                continue;
              }
            }

            if (token.value === CalculatorOperatorTokenValue.Power) {
              result = prevToken.power(nextToken);
            }

            const isPowerTokens = tokens.some(
              (token) => token.value === CalculatorOperatorTokenValue.Power
            );

            if (
              !isPowerTokens &&
              token.value === CalculatorOperatorTokenValue.Divide
            ) {
              result = prevToken.divide(nextToken);
            }

            const isDivideTokens =
              isPowerTokens ||
              tokens.some(
                (token) => token.value === CalculatorOperatorTokenValue.Divide
              );

            if (
              !isDivideTokens &&
              token.value === CalculatorOperatorTokenValue.Multiply
            ) {
              result = prevToken.multiply(nextToken);
            }

            const isMultiplyTokens =
              isDivideTokens ||
              tokens.some(
                (token) => token.value === CalculatorOperatorTokenValue.Multiply
              );

            if (
              !isMultiplyTokens &&
              token.value === CalculatorOperatorTokenValue.Subtract
            ) {
              result = prevToken.subtract(nextToken);
            }

            const isSubtractTokens =
              isMultiplyTokens ||
              tokens.some(
                (token) => token.value === CalculatorOperatorTokenValue.Subtract
              );

            if (
              !isSubtractTokens &&
              token.value === CalculatorOperatorTokenValue.Add
            ) {
              result = prevToken.add(nextToken);
            }

            const isAddTokens =
              isSubtractTokens ||
              tokens.some(
                (token) => token.value === CalculatorOperatorTokenValue.Subtract
              );

            if (
              !isAddTokens &&
              token.value === CalculatorOperatorTokenValue.Convert &&
              prevToken instanceof CalculatorUnitToken &&
              nextToken instanceof CalculatorUnitToken
            ) {
              try {
                result = prevToken.convert(nextToken.unit.symbol);
              } catch {
                continue;
              }
            }
          } else if (
            prevToken &&
            prevToken.value instanceof Date &&
            (nextToken instanceof CalculatorDateToken ||
              nextToken instanceof CalculatorUnitToken) &&
            !(
              prevToken instanceof CalculatorDateToken &&
              prevToken.date.type === CalculatorDateTokenDateType.Time
            ) &&
            !(
              nextToken instanceof CalculatorDateToken &&
              nextToken.date.type === CalculatorDateTokenDateType.Time
            )
          ) {
            const isNumberToken = tokens.some((token, index) => {
              const prevToken = tokens[index - 1];
              const nextToken = tokens[index + 1];

              return (
                token instanceof CalculatorOperatorToken &&
                prevToken instanceof CalculatorNumberToken &&
                nextToken instanceof CalculatorNumberToken
              );
            });

            if (!isNumberToken) {
              if (
                nextToken instanceof CalculatorDateToken &&
                (token.value === CalculatorOperatorTokenValue.Subtract ||
                  token.value === CalculatorOperatorTokenValue.Add)
              ) {
                result = new CalculatorUnitToken(
                  dayjs(prevToken.value as Date).diff(nextToken.value, "days"),
                  config.units["day"]
                );
              } else if (nextToken instanceof CalculatorUnitToken) {
                let dateType = CalculatorDateTokenDateType.Date;

                if (
                  prevToken instanceof CalculatorDateToken &&
                  prevToken.date.type === CalculatorDateTokenDateType.Time
                ) {
                  if (!lessThanHourUnits.includes(nextToken.unit.symbol)) {
                    dateType = CalculatorDateTokenDateType.DateTime;
                  } else {
                    dateType = CalculatorDateTokenDateType.Time;
                  }
                } else if (lessThanHourUnits.includes(nextToken.unit.symbol)) {
                  dateType = CalculatorDateTokenDateType.DateTime;
                }

                if (token.value === CalculatorOperatorTokenValue.Subtract) {
                  result = new CalculatorDateToken(
                    dayjs(prevToken.value as Date)
                      .subtract(
                        nextToken.value,
                        nextToken.unit.symbol as ManipulateType
                      )
                      .toDate(),
                    {
                      type: dateType,
                    }
                  );
                }

                if (token.value === CalculatorOperatorTokenValue.Add) {
                  result = new CalculatorDateToken(
                    dayjs(prevToken.value as Date)
                      .add(
                        nextToken.value,
                        nextToken.unit.symbol as ManipulateType
                      )
                      .toDate(),
                    {
                      type: dateType,
                    }
                  );
                }
              }
            }
          }

          if (result !== undefined) {
            if (token.method) {
              tokens.splice(index, 2, result);
            } else {
              tokens.splice(index - 1, 3, result);
            }

            break;
          }
        }
      }
    }

    return { tokens, inputTokens };
  }

  async refreshCurrencyData() {
    try {
      const { response } = await NetworkService.shared.load(
        CurrencyRates,
        CurrencyRates.requests.rates
      );

      const data = response.data.data;

      const currencyData: Record<string, CurrencyRate> = {};

      data.forEach((currency) => {
        currencyData[currency.code] = currency;
      });

      this.currencyData = currencyData;
    } catch {}
  }

  evaluate(input: string): CalculatorResult | undefined {
    const { tokens, inputTokens } = this.calculate(input.toLowerCase());

    if (tokens.length > 1) {
      return undefined;
    }

    let result = tokens[0];

    if (!result) {
      return undefined;
    }

    if (result instanceof CalculatorOperatorToken) {
      return undefined;
    }

    if (
      !result.displayDefault &&
      (input.toLowerCase().match(regexWithoutBrackets)?.length || 0) < 2
    ) {
      return undefined;
    }

    if (
      result instanceof CalculatorUnitToken &&
      !inputTokens.some((token) => token instanceof CalculatorOperatorToken)
    ) {
      try {
        result = result.convert("best");
      } catch {}
    }

    if (
      result instanceof CalculatorDateToken &&
      result.date.timezone &&
      !inputTokens.some((token) => token instanceof CalculatorOperatorToken)
    ) {
      result.date.localTime = !result.date.convertedTime;
      result.value = result.convert(dayjs.tz.guess()).toDate();
    }

    let type = CalculatorResultType.None;

    inputTokens.forEach((token) => {
      if (type !== CalculatorResultType.Equation) {
        if (token.type === CalculatorTokenType.City) {
          if (type === CalculatorResultType.None) {
            type = CalculatorResultType.City;
          } else {
            type = CalculatorResultType.TimezoneConversion;
          }
        } else if (token.type === CalculatorTokenType.Country) {
          if (type === CalculatorResultType.None) {
            type = CalculatorResultType.Country;
          } else {
            type = CalculatorResultType.TimezoneConversion;
          }
        } else if (token.type === CalculatorTokenType.Currency) {
          type = CalculatorResultType.Currency;
        } else if (token.type === CalculatorTokenType.Date) {
          type = CalculatorResultType.Date;
        } else if (token.type === CalculatorTokenType.Number) {
          type = CalculatorResultType.Number;
        } else if (token instanceof CalculatorOperatorToken) {
          if (
            token.value !== CalculatorOperatorTokenValue.Convert &&
            token.value !== CalculatorOperatorTokenValue.TimeDifference
          ) {
            type = CalculatorResultType.Equation;
          }
        } else if (token.type === CalculatorTokenType.Timezone) {
          type = CalculatorResultType.TimezoneConversion;
        } else if (token.type === CalculatorTokenType.Unit) {
          type = CalculatorResultType.UnitConversion;
        }
      } else {
        type = CalculatorResultType.Equation;
      }
    });

    return { result, type };
  }
}

export const calculator = new Calculator();
