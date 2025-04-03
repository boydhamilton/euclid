import { evaluate } from "mathjs";

export const convertToEvaluatable = (latex) => {
  let result = latex;

  result = result.replace(/\\^{([^}]+)}/g, "^($1)");

  result = result.replace(/\\cdot/g, "*");
  result = result.replace(/\\frac{([^}]+)}{([^}]+)}/g, "($1)/($2)");
  result = result.replace(/\\sqrt{([^}]+)}/g, "sqrt($1)");

  result = result.replace(/\\sin\s*\(([^)]+)\)/g, "sin($1)");
  result = result.replace(/\\cos\s*\(([^)]+)\)/g, "cos($1)");

  // Implicit multiplication handling
  result = result.replace(/(\d)([a-zA-Z\(])/g, '$1*$2');
  result = result.replace(/([a-zA-Z\)])(\d)/g, '$1*$2');
  result = result.replace(/\)\s*(\d+)/g, (match, digits) => `)*${digits}`);
  result = result.replace(/\)(\d+)/g, (match, digits) => `)*${digits}`);

  return result;
};

export const evaluateLatexExpression = (latex) => {
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

  // Convert normal math expressions
  try {
    const convertedLine = convertToEvaluatable(latex);
    return evaluate(convertedLine);
  } catch (error) {
    return "";
  }
};

const evaluateSummation = (variable, start, end, expression) => {
    let sum = 0;
    const parsedExpr = convertToEvaluatable(expression); // Convert to evaluatable form
    
    for (let i = start; i <= end; i++) {
      let evalExpr = parsedExpr.replace(new RegExp(`\\b${variable}\\b`, "g"), `(${i})`); // Ensure proper replacement
      sum += evaluate(evalExpr);
    }
    return sum;
  };
  
  const evaluateProduct = (variable, start, end, expression) => {
    let product = 1;
    const parsedExpr = convertToEvaluatable(expression); // Convert to evaluatable form
  
    for (let i = start; i <= end; i++) {
      let evalExpr = parsedExpr.replace(new RegExp(`\\b${variable}\\b`, "g"), `(${i})`); // Ensure proper replacement
      product *= evaluate(evalExpr);
    }
    return product;
  };
  