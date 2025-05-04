
const LETTER = /[a-zA-Z]/
const WHITESPACE = /\s+/
const NUMBER = /^[0-9]+$/
const OPERATORS = ["+", "-", "*", "/", "%"]

const isLetter = character => LETTER.test(character)
const isWhitespace = character => WHITESPACE.test(character)
const isNumber = character => NUMBER.test(character)
const isOpeningParenthesis = character => character === "("
const isClosingParenthesis = character => character === ")"
const isOpeningBrace = character => character === "{"
const isClosingBrace = character => character === "}"
const isParenthesis = character =>
  isOpeneningParenthesis(character) || isClosingParenthesis(character)
const isOperator = character => OPERATORS.includes(character)
const isLatexPrelude = character => character === "\\"

const chartype = {
  isLetter,
  isWhitespace,
  isNumber,
  isOpeningParenthesis,
  isClosingParenthesis,
  isOpeningBrace,
  isClosingBrace,
  isParenthesis,
  isOperator,
  isLatexPrelude
}

export default chartype