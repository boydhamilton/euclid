import tokenize from "./Lexer";         
import parse from "./Parser";           
import { evaluateAST } from "./EvaluateAST";

export function evaluateLatex(input, env = {}) {
  try {
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const result = evaluateAST(ast, env);
    return result;
  } catch (error) {
    console.error("Evaluation error:", error.message);
    return `Error: ${error.message}`;
  }
  

}
