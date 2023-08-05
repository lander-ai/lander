import dayjs from "dayjs";
import { locationData } from "./location-data";
import {
  CalculatorOperatorTokenValue,
  CalculatorUnitTokenValue,
} from "./types";
import { expandSIUnit } from "./util";

interface UnitConversion {
  type: CalculatorUnitTokenValue;
  conversions: Array<{
    names: string[];
    symbol: string;
    ratio: number;
    best?: string[];
  }>;
}

interface CalculatorConfigUnit {
  type: CalculatorUnitTokenValue;
  symbol: string;
  ratio: number;
  best?: string[];
}

export const unitConversions: Array<UnitConversion> = [
  {
    type: CalculatorUnitTokenValue.Volume,
    conversions: [
      {
        names: ["l", "liter", "liters", "litre", "litres"],
        symbol: "L",
        ratio: 1,
      },
      ...expandSIUnit({
        names: ["l", "liter", "liters", "litre", "litres"],
        symbol: "L",
      }),
      {
        names: ["teaspoon", "teaspoons"],
        symbol: "tsp",
        ratio: 0.0049292,
        best: ["mL"],
      },
      {
        names: ["tablespoon", "tablespoons"],
        symbol: "tbsp",
        ratio: 0.014788,
        best: ["mL"],
      },
      {
        names: ["cps"],
        symbol: "cup",
        ratio: 0.236588,
        best: ["mL"],
      },
      {
        names: ["pt", "pints"],
        symbol: "pint",
        ratio: 0.56826,
        best: ["L"],
      },
      {
        names: ["quarts"],
        symbol: "qt",
        ratio: 1.13652,
        best: ["L"],
      },
      {
        names: ["gallon", "gallons"],
        symbol: "gal",
        ratio: 4.54609,
        best: ["L"],
      },
    ],
  },
  {
    type: CalculatorUnitTokenValue.Length,
    conversions: [
      {
        names: ["meter", "meters", "metre", "metres"],
        symbol: "m",
        ratio: 1,
      },
      ...expandSIUnit({
        names: ["meter", "metre", "meters", "metres"],
        symbol: "m",
      }),
      {
        names: ["'", "foot", "feet"],
        symbol: "ft",
        ratio: 0.3048,
        best: ["m"],
      },
      {
        names: ['"', "inch", "inches"],
        symbol: "in",
        ratio: 0.0254,
        best: ["cm"],
      },
      {
        names: ["yard", "yards"],
        symbol: "yd",
        ratio: 0.9144,
        best: ["m"],
      },
      {
        names: ["mile", "miles"],
        symbol: "mi",
        ratio: 1609.344,
        best: ["km"],
      },
    ],
  },
  {
    type: CalculatorUnitTokenValue.Mass,
    conversions: [
      {
        names: ["gram", "grams"],
        symbol: "g",
        ratio: 1,
      },
      ...expandSIUnit({
        names: ["gram", "grams"],
        symbol: "g",
      }),
      {
        names: ["tonne", "tonnes", "metric ton", "metric tons"],
        symbol: "t",
        ratio: 1e6,
      },
      {
        names: ["kilotonne", "kilotonnes"],
        symbol: "kt",
        ratio: 1e9,
      },
      {
        names: ["megatonne", "megatonnes"],
        symbol: "Mt",
        ratio: 1e12,
      },
      {
        names: ["gigatonne", "gigatonnes"],
        symbol: "Gt",
        ratio: 1e15,
      },
      {
        names: ["pound", "pounds"],
        symbol: "lb",
        ratio: 453.59237,
        best: ["kg"],
      },
      {
        names: ["stone", "stones"],
        symbol: "st",
        ratio: 6350.29318,
        best: ["t"],
      },
      {
        names: ["ounce", "ounces"],
        symbol: "oz",
        ratio: 28.349523125,
        best: ["g"],
      },
    ],
  },
  {
    type: CalculatorUnitTokenValue.MemoryStorage,
    conversions: [
      {
        names: ["byte", "bytes", "octect", "octects"],
        symbol: "B",
        ratio: 1,
      },
      {
        names: ["KB", "kb", "kilobyte", "kilobytes"],
        symbol: "kB",
        ratio: 1e3,
      },
      {
        names: ["mb", "megabyte", "megabytes"],
        symbol: "MB",
        ratio: 1e6,
      },
      {
        names: ["gb", "gigabyte", "gigabytes"],
        symbol: "GB",
        ratio: 1e9,
      },
      {
        names: ["tb", "terabyte", "terabytes"],
        symbol: "TB",
        ratio: 1e12,
      },
      {
        names: ["pb", "petabyte", "petabytes"],
        symbol: "PB",
        ratio: 1e15,
      },
      { names: ["bits"], symbol: "bit", ratio: 0.125 },
    ],
  },
  {
    type: CalculatorUnitTokenValue.Duration,
    conversions: [
      {
        names: ["second", "seconds"],
        symbol: "s",
        ratio: 1,
        best: ["minute"],
      },
      ...expandSIUnit({
        names: ["second", "seconds"],
        symbol: "s",
      }),
      {
        names: ["min", "minute", "minutes"],
        symbol: "minute",
        ratio: 60,
        best: ["s"],
      },
      {
        names: ["hours"],
        symbol: "hour",
        ratio: 3600,
        best: ["minute"],
      },
      {
        names: ["d", "days"],
        symbol: "day",
        ratio: 86400,
        best: ["hour"],
      },
      {
        names: ["wk", "weeks"],
        symbol: "week",
        ratio: 604800,
        best: ["month"],
      },
      {
        names: ["months"],
        symbol: "month",
        ratio: 2.628e6,
        best: ["week"],
      },
      {
        names: ["yr", "years"],
        symbol: "year",
        ratio: 3.154e7,
        best: ["week"],
      },
      {
        names: ["decades"],
        symbol: "decade",
        ratio: 3.154e8,
        best: ["year"],
      },
      {
        names: ["centuries"],
        symbol: "century",
        ratio: 3.154e9,
        best: ["year"],
      },
      {
        names: ["millennia"],
        symbol: "millennium",
        ratio: 3.154e10,
        best: ["year"],
      },
    ],
  },
];

export const calculatorConfig = {
  operators: {
    "+": { type: CalculatorOperatorTokenValue.Add },
    add: { type: CalculatorOperatorTokenValue.Add },
    plus: { type: CalculatorOperatorTokenValue.Add },
    "-": { type: CalculatorOperatorTokenValue.Subtract },
    minus: { type: CalculatorOperatorTokenValue.Subtract },
    subtract: { type: CalculatorOperatorTokenValue.Subtract },
    "*": { type: CalculatorOperatorTokenValue.Multiply },
    times: { type: CalculatorOperatorTokenValue.Multiply },
    multiply: { type: CalculatorOperatorTokenValue.Multiply },
    "multiply by": { type: CalculatorOperatorTokenValue.Multiply },
    "multiplied by": { type: CalculatorOperatorTokenValue.Multiply },
    by: { type: CalculatorOperatorTokenValue.Multiply },
    "/": { type: CalculatorOperatorTokenValue.Divide },
    divide: { type: CalculatorOperatorTokenValue.Divide },
    "divide by": { type: CalculatorOperatorTokenValue.Divide },
    "divided by": { type: CalculatorOperatorTokenValue.Divide },
    over: { type: CalculatorOperatorTokenValue.Divide },
    power: { type: CalculatorOperatorTokenValue.Power },
    "**": { type: CalculatorOperatorTokenValue.Power },
    "^": { type: CalculatorOperatorTokenValue.Power },
    "to the power of": { type: CalculatorOperatorTokenValue.Power },
    as: { type: CalculatorOperatorTokenValue.Convert },
    in: { type: CalculatorOperatorTokenValue.Convert },
    to: { type: CalculatorOperatorTokenValue.Convert },
    until: { type: CalculatorOperatorTokenValue.TimeDifference },
    ln: {
      type: CalculatorOperatorTokenValue.Method,
      method: (x: number) => Math.log(x),
    },
    log: {
      type: CalculatorOperatorTokenValue.Method,
      method: (x: number) => Math.log10(x),
    },
    sin: {
      type: CalculatorOperatorTokenValue.Method,
      method: (x: number) => Math.sin(x),
    },
    cos: {
      type: CalculatorOperatorTokenValue.Method,
      method: (x: number) => Math.cos(x),
    },
    tan: {
      type: CalculatorOperatorTokenValue.Method,
      method: (x: number) => Math.tan(x),
    },
  },
  numbers: {
    pi: 3.1415926536,
    e: 2.7182818285,
  },
  dates: {
    yesterday: () => dayjs().subtract(1, "day").startOf("day").toDate(),
    today: () => dayjs().startOf("day").toDate(),
    now: () => new Date(),
    tomorrow: () => dayjs().add(1, "day").startOf("day").toDate(),
    christmas: () => {
      const now = dayjs();
      let christmas = dayjs().month(11).date(25);

      if (now.isAfter(christmas)) {
        christmas = christmas.add(1, "year");
      }

      return christmas.toDate();
    },
    "last week": () => dayjs().subtract(1, "week").startOf("week").toDate(),
    "last month": () => dayjs().subtract(1, "month").startOf("month").toDate(),
    "last year": () => dayjs().subtract(1, "year").startOf("year").toDate(),
    "next week": () => dayjs().add(1, "week").startOf("week").toDate(),
    "next month": () => dayjs().add(1, "month").startOf("month").toDate(),
    "new year": () => dayjs().add(1, "year").startOf("year").toDate(),
    "next year": () => dayjs().add(1, "year").startOf("year").toDate(),
  },
  units: unitConversions.reduce((curr, next) => {
    next.conversions.forEach((conversion) => {
      [...conversion.names, conversion.symbol].forEach((name) => {
        curr[name] = {
          type: next.type,
          symbol: conversion.symbol,
          ratio: conversion.ratio,
          best: conversion.best,
        };
      });
    });
    return curr;
  }, {} as Record<string, CalculatorConfigUnit>),
  ...locationData,
} as const;
