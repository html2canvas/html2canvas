import {CSSFunction, CSSValue, isDimensionToken} from '../syntax/parser';
import {DimensionToken, FLAG_INTEGER, NumberValueToken, TokenType} from '../syntax/tokenizer';
import {isLength} from './length';

export type LengthPercentage = DimensionToken | NumberValueToken | CSSFunction;
export type LengthPercentageTuple = [LengthPercentage] | [LengthPercentage, LengthPercentage];

export const isLengthPercentage = (token: CSSValue): token is LengthPercentage =>
    token.type === TokenType.PERCENTAGE_TOKEN || isLength(token) || isCalcFunction(token);

const isCalcFunction = (token: CSSValue): token is CSSFunction =>
    token.type === TokenType.FUNCTION && (token as CSSFunction).name === 'calc';

export const parseLengthPercentageTuple = (tokens: LengthPercentage[]): LengthPercentageTuple =>
    tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
export const ZERO_LENGTH: NumberValueToken = {
    type: TokenType.NUMBER_TOKEN,
    number: 0,
    flags: FLAG_INTEGER
};

export const FIFTY_PERCENT: NumberValueToken = {
    type: TokenType.PERCENTAGE_TOKEN,
    number: 50,
    flags: FLAG_INTEGER
};

export const HUNDRED_PERCENT: NumberValueToken = {
    type: TokenType.PERCENTAGE_TOKEN,
    number: 100,
    flags: FLAG_INTEGER
};

export const getAbsoluteValueForTuple = (
    tuple: LengthPercentageTuple,
    width: number,
    height: number
): [number, number] => {
    const [x, y] = tuple;
    return [getAbsoluteValue(x, width), getAbsoluteValue(typeof y !== 'undefined' ? y : x, height)];
};

/**
 * Returns the raw numeric value of a LengthPercentage token.
 * For simple tokens this is `token.number`, for calc() it evaluates with a parent of 0
 * (meaning percentages resolve to 0 — use getAbsoluteValue for percentage-aware resolution).
 */
export const getNumber = (token: LengthPercentage): number => {
    if (token.type === TokenType.FUNCTION) {
        return evaluateCalc((token as CSSFunction).values, 0);
    }
    return (token as NumberValueToken | DimensionToken).number;
};

export const getAbsoluteValue = (token: LengthPercentage, parent: number): number => {
    if (token.type === TokenType.PERCENTAGE_TOKEN) {
        return (token.number / 100) * parent;
    }

    if (isDimensionToken(token)) {
        switch (token.unit) {
            case 'rem':
            case 'em':
                return 16 * token.number; // TODO use correct font-size
            case 'px':
            default:
                return token.number;
        }
    }

    if (token.type === TokenType.FUNCTION) {
        return evaluateCalc((token as CSSFunction).values, parent);
    }

    return token.number;
};

/**
 * Evaluates a calc() expression given the parsed token values.
 * Supports +, -, *, / operators and nested calc().
 * Percentages are resolved relative to `parent`.
 */
const evaluateCalc = (values: CSSValue[], parent: number): number => {
    // Flatten tokens, ignoring whitespace
    const tokens = values.filter((t) => t.type !== TokenType.WHITESPACE_TOKEN);
    return evaluateExpression(tokens, 0, parent).value;
};

interface EvalResult {
    value: number;
    index: number;
}

/**
 * Simple recursive-descent expression evaluator for calc() contents.
 * Grammar: expression = term (('+' | '-') term)*
 *          term = factor (('*' | '/') factor)*
 *          factor = number | percentage | dimension | '(' expression ')' | calc(expression)
 */
const evaluateExpression = (tokens: CSSValue[], startIndex: number, parent: number): EvalResult => {
    let {value, index} = evaluateTerm(tokens, startIndex, parent);

    while (index < tokens.length) {
        const op = tokens[index];
        if (op.type === TokenType.DELIM_TOKEN && (op.value === '+' || op.value === '-')) {
            const right = evaluateTerm(tokens, index + 1, parent);
            value = op.value === '+' ? value + right.value : value - right.value;
            index = right.index;
        } else {
            break;
        }
    }

    return {value, index};
};

const evaluateTerm = (tokens: CSSValue[], startIndex: number, parent: number): EvalResult => {
    let {value, index} = evaluateFactor(tokens, startIndex, parent);

    while (index < tokens.length) {
        const op = tokens[index];
        if (op.type === TokenType.DELIM_TOKEN && (op.value === '*' || op.value === '/')) {
            const right = evaluateFactor(tokens, index + 1, parent);
            value = op.value === '*' ? value * right.value : value / right.value;
            index = right.index;
        } else {
            break;
        }
    }

    return {value, index};
};

const evaluateFactor = (tokens: CSSValue[], index: number, parent: number): EvalResult => {
    if (index >= tokens.length) {
        return {value: 0, index};
    }

    const token = tokens[index];

    // Nested calc()
    if (token.type === TokenType.FUNCTION && (token as CSSFunction).name === 'calc') {
        const result = evaluateCalc((token as CSSFunction).values, parent);
        return {value: result, index: index + 1};
    }

    // Parenthesized sub-expression
    if (token.type === TokenType.LEFT_PARENTHESIS_TOKEN) {
        // Find matching right paren and evaluate contents
        const {value, index: endIndex} = evaluateExpression(tokens, index + 1, parent);
        // Skip the right parenthesis
        return {value, index: endIndex + 1};
    }

    // Percentage
    if (token.type === TokenType.PERCENTAGE_TOKEN) {
        return {value: (token.number / 100) * parent, index: index + 1};
    }

    // Dimension (px, em, rem, etc.)
    if (isDimensionToken(token)) {
        let val: number;
        switch (token.unit) {
            case 'rem':
            case 'em':
                val = 16 * token.number;
                break;
            case 'px':
            default:
                val = token.number;
                break;
        }
        return {value: val, index: index + 1};
    }

    // Plain number
    if (token.type === TokenType.NUMBER_TOKEN) {
        return {value: token.number, index: index + 1};
    }

    // Unrecognized token — skip it
    return {value: 0, index: index + 1};
};
