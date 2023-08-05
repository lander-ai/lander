import { calculatorConfig, unitConversions } from "./config";
import { CalculatorUnitToken } from "./token";

interface ExpandSIUnitOpts {
  names: string[];
  symbol: string;
}

export const si = [
  { prefix: "peta", symbol: "P", value: 1e15 },
  { prefix: "tera", symbol: "T", value: 1e12 },
  { prefix: "giga", symbol: "G", value: 1e9 },
  { prefix: "mega", symbol: "M", value: 1e6 },
  { prefix: "kilo", symbol: "k", value: 1e3 },
  { prefix: "hecto", symbol: "h", value: 1e2 },
  { prefix: "deca", symbol: "da", value: 1e1 },
  { prefix: "deci", symbol: "d", value: 1e-1 },
  { prefix: "centi", symbol: "c", value: 1e-2 },
  { prefix: "milli", symbol: "m", value: 1e-3 },
  { prefix: "micro", symbol: "μ", value: 1e-6 },
  { prefix: "nano", symbol: "n", value: 1e-9 },
  { prefix: "pico", symbol: "p", value: 1e-12 },
  { prefix: "femto", symbol: "f", value: 1e-15 },
];

export const expandSIUnit = (opts: ExpandSIUnitOpts) => {
  return si.map((siUnit) => ({
    names: opts.names.map((name) => `${siUnit.prefix}${name}`),
    symbol: `${siUnit.symbol}${opts.symbol}`,
    ratio: siUnit.value,
  }));
};

export const convert = (from: CalculatorUnitToken, to: "best" | string) => {
  let unit = calculatorConfig.units[to];

  if (to === "best") {
    let bestSymbol = from.unit.symbol;

    const conversions = unitConversions.find(
      (conversion) => conversion.type === from.unit.type
    )?.conversions;

    const nextUnit = conversions?.find(
      (conversion) => conversion.symbol === from.unit.symbol
    );

    if (nextUnit?.best) {
      bestSymbol = nextUnit.best[0];
    } else {
      const b = conversions?.find((conversion) =>
        conversion.best?.includes(from.unit.symbol)
      );

      if (b) {
        bestSymbol = b.symbol;
      }
    }

    unit = calculatorConfig.units[bestSymbol];
  }

  if (!unit) {
    throw new Error(`Unable to find convert to ${to}`);
  }

  if (unit.type !== from.unit.type) {
    throw new Error(`Unable to convert ${from.unit.symbol} to ${to}`);
  }

  return new CalculatorUnitToken(from.value * (from.unit.ratio / unit.ratio), {
    ratio: unit.ratio,
    symbol: unit.symbol,
    type: from.unit.type,
  });
};
