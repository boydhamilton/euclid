import chartype from "./TokenLookup";

const tokenize = (input) => {
  const tokens = [];
  let cursor = 0;

  while (cursor < input.length) {
    const char = input[cursor];

    // skip whitespace
    if (chartype.isWhitespace(char)) {
      cursor++;
      continue;
    }

    // latex commands
    if (chartype.isLatexPrelude(char)) {
      let word = "";
      cursor++; // skip the slash itself

      while (cursor < input.length && chartype.isLetter(input[cursor])) {
        word += input[cursor];
        cursor++;
      }

      tokens.push({ type: "Function", value: word });
      continue;
    }

    //  braces
    if (chartype.isOpeningBrace(char)) {
      tokens.push({ type: "BraceOpen", value: char });
      cursor++;
      continue;
    }

    if (chartype.isClosingBrace(char)) {
      tokens.push({ type: "BraceClose", value: char });
      cursor++;
      continue;
    }

    // parentheses
    if (chartype.isOpeningParenthesis(char)){
        tokens.push( { type: "ParenthesisOpen", value: char});
        cursor++;
        continue;
    }
    if (chartype.isClosingParenthesis(char)){
        tokens.push( { type: "ParenthesisClose", value: char});
        cursor++;
        continue;
    }

    //  numbers
    if (chartype.isNumber(input[cursor])) {
      let num = "";
      while (cursor < input.length && chartype.isNumber(input[cursor])) {
        num += input[cursor];
        cursor++;
      }
      tokens.push({ type: "Number", value: num });
      continue;
    }

    //  chartype (like variables a, b, x)
    if (chartype.isLetter(char)) {
      let id = "";
      while (cursor < input.length && chartype.isLetter(input[cursor])) {
        id += input[cursor];
        cursor++;
      }
      tokens.push({ type: "Identifier", value: id });
      continue;
    }

    //  operators
    if (chartype.isOperator(char)) {
      tokens.push({ type: "Operator", value: char });
      cursor++;
      continue;
    }

    // Unknown character fallback just skip
    // tokens.push({ type: "Unknown", value: char });
    cursor++;
  }

  return tokens;
};

export default tokenize;
