
import { evaluate, derivative } from "mathjs";


const environment = {}; // declaraed variable storage

export const convertToEvaluatable = (latex) => {
  let result = latex;

  result = result.replace(/\\pi/g, "pi");

  result = result.replace(/\^\{([^}]+)\}/g, (_, exp) => {
    return `^(${convertToEvaluatable(exp)})`;
  });

  result = result.replace(/\\frac{([^}]+)}{([^}]+)}/g, (_, numerator, denominator) => {
    return `(${convertToEvaluatable(numerator)})/(${convertToEvaluatable(denominator)})`;
  });

  result = result.replace(/\\sqrt{([^}]+)}/g, (_, radicand) => {
    return `sqrt(${convertToEvaluatable(radicand)})`;
  });

  // Replace trig
  const trigFuncs = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
  for (const func of trigFuncs) {
    const regex = new RegExp(`\\\\${func}\\s*\\(([^)]+)\\)`, 'g');
    result = result.replace(regex, (_, arg) => {
      return `${func}(${convertToEvaluatable(arg)})`;
    });
  }

  // multiplication handling
  result = result.replace(/\\cdot/g, "*");

  return result;
};

export const evaluateLatexExpression = (latex) => {

  // variables
  let declarationmatch = latex.match(/^([a-z]+)\s*=\s*(.+)$/);
  if (declarationmatch) {
    let [, variableName, expression] = declarationmatch;
    try {
      const evaluatedValue = evaluate(convertToEvaluatable(expression), environment);
      environment[variableName] = evaluatedValue;
      return evaluatedValue;
    } catch (error) {
      console.error("error evaluating variable declaration:", error);
      return "";
    }
  }

  // Match derivative expressions: d/dx f(x)
  let derivativeMatch = latex.match(/d\/d([A-z])\((.*)\)/);
  if (derivativeMatch) {
    let [, variable, expression] = derivativeMatch;
    return evaluateDerivative(variable, expression);
  }

  // Match summation expressions: \sum_{i=a}^{b} f(i)
  let sumMatch = latex.match(/\\sum_{([a-z])=([\d.-]+)}\^{([\d.-]+)}\s*(.*)/);
  if (sumMatch) {
    let [, variable, start, end, expression] = sumMatch;
    return evaluateSummation(variable, Number(start), Number(end), expression);
  }

  // Match product expressions: \prod_{i=a}^{b} f(i)
  let prodMatch = latex.match(/\\prod_{([a-z])=([\d.-]+)}\^{([\d.-]+)}\s*(.*)/);
  if (prodMatch) {
    let [, variable, start, end, expression] = prodMatch;
    return evaluateProduct(variable, Number(start), Number(end), expression);
  }

  // Match integral expressions: \int_{a}^{b} f(x) dx
  let intMatch = latex.match(/\\int_{([\d.-]+)}\^{([\d.-]+)}\s*(.*)d([a-z])/);
  if (intMatch) {
    let [, start, end, expression, variable] = intMatch;
    return evaluateIntegral(variable, Number(start), Number(end), expression);
  }

  // Convert normal math expressions
  try {
    const convertedLine = convertToEvaluatable(latex);
    return evaluate(convertedLine, environment);
  } catch (error) {
    return "";
  }
};

const evaluateSummation = (variable, start, end, expression) => {
  let sum = 0;
  const parsedExpr = convertToEvaluatable(expression);

  for (let i = start; i <= end; i++) {
    let evalExpr = parsedExpr.replace(new RegExp(`\\b${variable}\\b`, "g"), `(${i})`);
    try{
        sum += evaluate(evalExpr, environment);
    } catch (error){
        return "Error in summation evaluation";
    }
  }
  return sum;
};

const evaluateProduct = (variable, start, end, expression) => {
  let product = 1;
  const parsedExpr = convertToEvaluatable(expression);

  for (let i = start; i <= end; i++) {
    let evalExpr = parsedExpr.replace(new RegExp(`\\b${variable}\\b`, "g"), `(${i})`);
    try {
        product *= evaluate(evalExpr, environment);
    } catch (error){
        return "Error in product evaluation";
    }
  }
  return product;
};

const evaluateIntegral = (variable, start, end, expression, N = 100) => {
  const dx = (end - start) / N;
  let integral = 0;
  const parsedExpr = convertToEvaluatable(expression);

  const evaluateAt = (x) => {
    const evalExpr = parsedExpr.replace(new RegExp(`\\b${variable}\\b`, "g"), `(${x})`);
    try {
      return evaluate(evalExpr, environment);
    } catch (error) {
      return NaN;
    }
  };

  if (isNaN(evaluateAt(start)) || isNaN(evaluateAt(end))) {
    return "Error: Cannot evaluate function at integration limits.";
  }

  integral += evaluateAt(start);
  integral += evaluateAt(end);

  for (let i = 1; i < N; i++) {
    const x = start + i * dx;
    const fx = evaluateAt(x);

    if (isNaN(fx)) {
      return `Error: Cannot evaluate function at x = ${x}.`;
    }

    if (i % 2 === 0) {
      integral += 2 * fx;
    } else {
      integral += 4 * fx;
    }
  }

  integral *= dx / 3;
  return integral;
};


function evaluateDerivative(variable, expression) {
  const parsedExpr = convertToEvaluatable(expression);
  const derived = derivative(parsedExpr, variable);

  // Maybe add functionality to display functions?
  console.log("Derivative: ", derived.toString());

  try {
    return derived.compile().evaluate(environment);
  } catch (error) {
    return "Error: As of now, only derivatives that are constant can be evaluated"
  }
}