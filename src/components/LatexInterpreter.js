
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


  // Match derivative expressions: \frac{d}{dx} \Big |_{x=a} f(x)
  // for evaluation at a point
  let derivativeAtPointMatch = latex.match(/\\frac{d}{d([a-zA-Z])}(?:\\Big)?\|_{\1=([-\d.]+)}\s*(.+)/);
  if( derivativeAtPointMatch) {
    let [, variable, point, expression] = derivativeAtPointMatch;
    return evaluateDerivativeAtPoint(variable, point, expression);
  }else{
    // Match derivative expressions: \frac{d}{dx} f(x)
    // for const functions
    let derivativeMatch = latex.match(/\\frac{d}{d([a-zA-Z])}(.+)/);
    if (derivativeMatch) {
      let [, variable, expression] = derivativeMatch;
      return evaluateDerivative(variable, expression);
    }
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

const evaluateIntegral = (variable, start, end, expression, err = 1e-6) => {
  
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
  // error is legit sooo bad
  // let K = evaluateAt(start) + evaluateAt(end);
  // let N = ((K * (end - start)^5)/(180 * err))^(1/4);
  let N = 500;

  const dx = (end - start) / N;
  let integral = 0;

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
  return integral.toFixed(5);
  //return integral.toFixed( Math.max(Math.log10(1/err) - 2, 1));
};

// const
function evaluateDerivative(variable, expression) {
  const parsedExpr = convertToEvaluatable(expression);
  const derived = derivative(parsedExpr, variable);

  console.log("Derivative: ", derived.toString());

  try {
    return derived.compile().evaluate(environment);
  } catch (error) {
    return "Error: As of now, only derivatives that are constant can be evaluated"
  }
}

function evaluateDerivativeAtPoint(variable, point, expression) {
  const parsedExpr = convertToEvaluatable(expression);
  let dx = 1e-6; // lim -> 0 ahh
  // lim x -> 0 f(x + h) - f(x) / h
  let derivativeAtPoint = (evaluateLatexExpression(parsedExpr.replace(new RegExp(`\\b${variable}\\b`, "g"), `(${point} + ${dx})`)) - evaluateLatexExpression(parsedExpr.replace(new RegExp(`\\b${variable}\\b`, "g"), `(${point})`))) / dx;
  return derivativeAtPoint.toFixed(5);
}