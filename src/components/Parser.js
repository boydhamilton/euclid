

const parse = (tokens) => {
    let current = 0;
  
    const peek = () => tokens[current];
    const consume = () => tokens[current++];
    const expect = (type) => {
      const token = peek();
      if (!token || token.type !== type) {
        throw new Error(`Expected ${type} but got ${token?.type}`);
      }
      return consume();
    };
  
    // order of operations lol
    const OP_PRECEDENCE = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        '^': 3
    };
    const RIGHT_ASSOCIATIVE = ['^'];

    // check implicit by checking types of adjacent tokens
    const isImplicitMultiplication = (prev, next) => {
      if(!prev || !next) return false;
      
      if (prev.type === "BinaryExpression" || prev.operator === "^") {
        return false;
      }

      const isValue = (token) =>
        ["NumberLiteral", "Identifier", "FunctionCall", "BraceClose", "ParenthesisClose"].includes(token?.type);

      const isStarter = (token) =>
        ["Identifier", "NumberLiteral", "FunctionCall", "ParenthesisOpen", "BraceOpen"].includes(token?.type);

      return isValue(prev) && isStarter(next);
    };

    const parseExpression = () => {
      return parseBinaryExpression(parsePrimary(), 0);
    };
    
    const parseBinaryExpression = (left, minPrecedence) => {
      while (true) {
        const token = peek();
        if (!token) break;
    
        let operator = null;
        let isImplicit = false;
    
        if (token.type === "BinaryExpression") {
          operator = token.value;
        } else if (isImplicitMultiplication(left, token)) {
          operator = "*";
          isImplicit = true;
        }
    
        if (!operator) break;
    
        const precedence = OP_PRECEDENCE[operator];
        if (precedence < minPrecedence) break;
    
        if (!isImplicit) consume(); // only consume if it's an explicit operator
    
        const nextMinPrecedence = RIGHT_ASSOCIATIVE.includes(operator)
          ? precedence
          : precedence + 1;
    
        let right = parsePrimary();
        right = parseBinaryExpression(right, nextMinPrecedence);
    
        left = {
          type: "BinaryExpression",
          operator,
          left,
          right
        };
      }
    
      return left;
    };
    
    
  
    const parsePrimary = () => {
        const token = peek();
      
        if (!token) throw new Error("Unexpected end of input");
      
        switch (token.type) {
          case "Number":
            consume();
            return { type: "NumberLiteral", value: parseFloat(token.value) };
      
          case "Identifier":
            consume();
            return { type: "Identifier", value: token.value };
      
          case "Function":
            consume();
            return parseFunction(token.value);
      
          case "ParenthesisOpen":
            consume(); // consume parens
            const expr = parseExpression();
            expect("ParenthesisClose");
            return expr;
      
          case "BraceOpen":
            consume();
            const braceExpr = parseExpression();
            expect("BraceClose");
            return braceExpr;
      
          default:
            throw new Error(`Unexpected token: ${token.type}`);
        }
    };
      

    const parseFunction = (name) => {
        switch (name) {
            case "frac": {
              expect("BraceOpen");
              const numerator = parseExpression();
              expect("BraceClose");
              expect("BraceOpen");
              const denominator = parseExpression();
              expect("BraceClose");
              return {
                type: "Fraction",
                numerator,
                denominator
              };
            }
          
            case "sqrt": {
              expect("BraceOpen");
              const value = parseExpression();
              expect("BraceClose");
              return {
                type: "Sqrt",
                value
              };
            }
          
            case "int": {
              expect("BraceOpen");
              const lower = parseExpression();
              expect("BraceClose");
              expect("BraceOpen");
              const upper = parseExpression();
              expect("BraceClose");
              const integrand = parseExpression();
              const dx = consume(); // e.g., { type: "Identifier", value: "x" }
          
              return {
                type: "Integral",
                variable: dx.value,
                lower,
                upper,
                integrand
              };
            }
            
            // todo i dont think this works
            case "sum": {
              // parse \sum_{i=a}^{b} f(i)
              expect("BraceOpen");
              const variable = parseExpression();
              expect("BraceClose");
              expect("BraceOpen");
              const start = parseExpression();
              expect("BraceClose");
              expect("BraceOpen");
              const end = parseExpression();
              expect("BraceClose");
              const body = parseExpression();
          
              return {
                type: "Summation",
                variable,
                start,
                end,
                body
              };
            }
          
            case "fracd": // imaginary macro for \frac{d}{dx}
              // Similar logic to derivative expressions
              break;
          
            default: {
              // default single-arg function like \sin{x}
              expect("BraceOpen");
              const arg = parseExpression();
              expect("BraceClose");
              return {
                type: "FunctionCall",
                name,
                args: [arg]
              };
            }
          }          
          
    };
      
  
    const ast = parseExpression();
  
    if (current < tokens.length) {
      throw new Error("Unexpected extra input");
    }
  
    return ast;
  };
  
  export default parse;
  