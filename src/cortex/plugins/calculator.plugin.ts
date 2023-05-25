import { evaluate } from "mathjs";
import { Plugin } from "~/cortex/plugin";

export class CalculatorPlugin implements Plugin {
  name = "Calculator";

  description = "Calculates mathematical expressions";

  modelDescription =
    "Useful for getting the result of a math expression. Input must be a valid codified mathematical expression.";

  call(input: string) {
    try {
      return evaluate(input).toString();
    } catch {
      return "Unable to evaluate expression";
    }
  }
}
