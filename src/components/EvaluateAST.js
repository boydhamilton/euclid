import { create, all } from "mathjs";

const math = create(all);
const defaultEnv = {};

export function evaluateAST(node, env = defaultEnv) {
  switch (node.type) {
    case "NumberLiteral":
      return Number(node.value);

    case "Identifier":
      if (env.hasOwnProperty(node.value)) {
        return env[node.value];
      } else {
        throw new Error(`Undefined variable: ${node.value}`);
      }

    case "BinaryExpression": {
      const left = evaluateAST(node.left, env);
      const right = evaluateAST(node.right, env);

      switch (node.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        case "^":
          return Math.pow(left, right);
        default:
          throw new Error(`Unknown operator: ${node.operator}`);
      }
    }

    case "FunctionCall": {
      const arg = evaluateAST(node.argument, env);

      switch (node.name) {
        case "sqrt":
          return Math.sqrt(arg);
        case "sin":
          return Math.sin(arg);
        case "cos":
          return Math.cos(arg);
        case "tan":
          return Math.tan(arg);
        case "sec":
          return 1 / Math.cos(arg);
        case "csc":
          return 1 / Math.sin(arg);
        case "cot":
          return 1 / Math.tan(arg);
        default:
          throw new Error(`Unknown function: \\${node.name}`);
      }
    }

    case "Fraction": {
      const numerator = evaluateAST(node.numerator, env);
      const denominator = evaluateAST(node.denominator, env);
      return numerator / denominator;
    }

    case "Sqrt": {
      const value = evaluateAST(node.value, env);
      return Math.sqrt(value);
    }

    case "Integral": {
      const { lower, upper, variable, integrand } = node;

      const a = evaluateAST(lower, env);
      const b = evaluateAST(upper, env);
      const steps = 500;
      const dx = (b - a) / steps;
      let sum = 0;

      for (let i = 0; i <= steps; i++) {
        const x = a + i * dx;
        const localEnv = { ...env, [variable]: x };
        const fx = evaluateAST(integrand, localEnv);

        if (i === 0 || i === steps) {
          sum += fx;
        } else if (i % 2 === 0) {
          sum += 2 * fx;
        } else {
          sum += 4 * fx;
        }
      }

      return (dx / 3) * sum;
    }

    case "Summation": {
      const { variable, start, end, body } = node;
      const from = evaluateAST(start, env);
      const to = evaluateAST(end, env);
      let sum = 0;

      for (let i = from; i <= to; i++) {
        const localEnv = { ...env, [variable.value]: i };
        sum += evaluateAST(body, localEnv);
      }

      return sum;
    }

    case "Product": {
      const { variable, start, end, body } = node;
      const from = evaluateAST(start, env);
      const to = evaluateAST(end, env);
      let product = 1;

      for (let i = from; i <= to; i++) {
        const localEnv = { ...env, [variable.value]: i };
        product *= evaluateAST(body, localEnv);
      }

      return product;
    }

    default:
      throw new Error(`Unknown AST node type: ${node.type}`);
  }
}
