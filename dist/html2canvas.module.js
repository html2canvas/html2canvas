/*!
 * html2canvas 1.8.0 <>
 * Copyright (c) 2026 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
import { toCodePoints, fromCodePoint, LineBreaker } from 'css-line-break';
import Color from 'colorjs.io/src/color.js';
import ColorSpace from 'colorjs.io/src/ColorSpace.js';
import sRGB from 'colorjs.io/src/spaces/srgb.js';
import sRGB_Linear from 'colorjs.io/src/spaces/srgb-linear.js';
import HSL from 'colorjs.io/src/spaces/hsl.js';
import HWB from 'colorjs.io/src/spaces/hwb.js';
import Lab from 'colorjs.io/src/spaces/lab.js';
import LCH from 'colorjs.io/src/spaces/lch.js';
import OKLab from 'colorjs.io/src/spaces/oklab.js';
import OKLCH from 'colorjs.io/src/spaces/oklch.js';
import P3 from 'colorjs.io/src/spaces/p3.js';
import P3_Linear from 'colorjs.io/src/spaces/p3-linear.js';
import REC_2020 from 'colorjs.io/src/spaces/rec2020.js';
import REC_2020_Linear from 'colorjs.io/src/spaces/rec2020-linear.js';
import XYZ_D65 from 'colorjs.io/src/spaces/xyz-d65.js';
import XYZ_D50 from 'colorjs.io/src/spaces/xyz-d50.js';
import Lab_D65 from 'colorjs.io/src/spaces/lab-d65.js';
import * as interpolation from 'colorjs.io/src/interpolation.js';
import { splitGraphemes } from 'text-segmentation';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var contains = function (bit, value) { return (bit & value) !== 0; };

// https://www.w3.org/TR/css-syntax-3
var FLAG_UNRESTRICTED = 1 << 0;
var FLAG_ID = 1 << 1;
var FLAG_INTEGER = 1 << 2;
var FLAG_NUMBER = 1 << 3;
var LINE_FEED = 0x000a;
var SOLIDUS = 0x002f;
var REVERSE_SOLIDUS = 0x005c;
var CHARACTER_TABULATION = 0x0009;
var SPACE = 0x0020;
var QUOTATION_MARK = 0x0022;
var EQUALS_SIGN = 0x003d;
var NUMBER_SIGN = 0x0023;
var DOLLAR_SIGN = 0x0024;
var PERCENTAGE_SIGN = 0x0025;
var APOSTROPHE = 0x0027;
var LEFT_PARENTHESIS = 0x0028;
var RIGHT_PARENTHESIS = 0x0029;
var LOW_LINE = 0x005f;
var HYPHEN_MINUS = 0x002d;
var EXCLAMATION_MARK = 0x0021;
var LESS_THAN_SIGN = 0x003c;
var GREATER_THAN_SIGN = 0x003e;
var COMMERCIAL_AT = 0x0040;
var LEFT_SQUARE_BRACKET = 0x005b;
var RIGHT_SQUARE_BRACKET = 0x005d;
var CIRCUMFLEX_ACCENT = 0x003d;
var LEFT_CURLY_BRACKET = 0x007b;
var QUESTION_MARK = 0x003f;
var RIGHT_CURLY_BRACKET = 0x007d;
var VERTICAL_LINE = 0x007c;
var TILDE = 0x007e;
var CONTROL = 0x0080;
var REPLACEMENT_CHARACTER = 0xfffd;
var ASTERISK = 0x002a;
var PLUS_SIGN = 0x002b;
var COMMA = 0x002c;
var COLON = 0x003a;
var SEMICOLON = 0x003b;
var FULL_STOP = 0x002e;
var NULL = 0x0000;
var BACKSPACE = 0x0008;
var LINE_TABULATION = 0x000b;
var SHIFT_OUT = 0x000e;
var INFORMATION_SEPARATOR_ONE = 0x001f;
var DELETE = 0x007f;
var EOF = -1;
var ZERO = 0x0030;
var a = 0x0061;
var e = 0x0065;
var f = 0x0066;
var u = 0x0075;
var z = 0x007a;
var A = 0x0041;
var E = 0x0045;
var F = 0x0046;
var U = 0x0055;
var Z = 0x005a;
var isDigit = function (codePoint) { return codePoint >= ZERO && codePoint <= 0x0039; };
var isSurrogateCodePoint = function (codePoint) { return codePoint >= 0xd800 && codePoint <= 0xdfff; };
var isHex = function (codePoint) {
    return isDigit(codePoint) || (codePoint >= A && codePoint <= F) || (codePoint >= a && codePoint <= f);
};
var isLowerCaseLetter = function (codePoint) { return codePoint >= a && codePoint <= z; };
var isUpperCaseLetter = function (codePoint) { return codePoint >= A && codePoint <= Z; };
var isLetter = function (codePoint) { return isLowerCaseLetter(codePoint) || isUpperCaseLetter(codePoint); };
var isNonASCIICodePoint = function (codePoint) { return codePoint >= CONTROL; };
var isWhiteSpace = function (codePoint) {
    return codePoint === LINE_FEED || codePoint === CHARACTER_TABULATION || codePoint === SPACE;
};
var isNameStartCodePoint = function (codePoint) {
    return isLetter(codePoint) || isNonASCIICodePoint(codePoint) || codePoint === LOW_LINE;
};
var isNameCodePoint = function (codePoint) {
    return isNameStartCodePoint(codePoint) || isDigit(codePoint) || codePoint === HYPHEN_MINUS;
};
var isNonPrintableCodePoint = function (codePoint) {
    return ((codePoint >= NULL && codePoint <= BACKSPACE) ||
        codePoint === LINE_TABULATION ||
        (codePoint >= SHIFT_OUT && codePoint <= INFORMATION_SEPARATOR_ONE) ||
        codePoint === DELETE);
};
var isValidEscape = function (c1, c2) {
    if (c1 !== REVERSE_SOLIDUS) {
        return false;
    }
    return c2 !== LINE_FEED;
};
var isIdentifierStart = function (c1, c2, c3) {
    if (c1 === HYPHEN_MINUS) {
        return isNameStartCodePoint(c2) || isValidEscape(c2, c3);
    }
    else if (isNameStartCodePoint(c1)) {
        return true;
    }
    else if (c1 === REVERSE_SOLIDUS && isValidEscape(c1, c2)) {
        return true;
    }
    return false;
};
var isNumberStart = function (c1, c2, c3) {
    if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
        if (isDigit(c2)) {
            return true;
        }
        return c2 === FULL_STOP && isDigit(c3);
    }
    if (c1 === FULL_STOP) {
        return isDigit(c2);
    }
    return isDigit(c1);
};
var stringToNumber = function (codePoints) {
    var c = 0;
    var sign = 1;
    if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
        if (codePoints[c] === HYPHEN_MINUS) {
            sign = -1;
        }
        c++;
    }
    var integers = [];
    while (isDigit(codePoints[c])) {
        integers.push(codePoints[c++]);
    }
    var int = integers.length ? parseInt(fromCodePoint.apply(void 0, integers), 10) : 0;
    if (codePoints[c] === FULL_STOP) {
        c++;
    }
    var fraction = [];
    while (isDigit(codePoints[c])) {
        fraction.push(codePoints[c++]);
    }
    var fracd = fraction.length;
    var frac = fracd ? parseInt(fromCodePoint.apply(void 0, fraction), 10) : 0;
    if (codePoints[c] === E || codePoints[c] === e) {
        c++;
    }
    var expsign = 1;
    if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
        if (codePoints[c] === HYPHEN_MINUS) {
            expsign = -1;
        }
        c++;
    }
    var exponent = [];
    while (isDigit(codePoints[c])) {
        exponent.push(codePoints[c++]);
    }
    var exp = exponent.length ? parseInt(fromCodePoint.apply(void 0, exponent), 10) : 0;
    return sign * (int + frac * Math.pow(10, -fracd)) * Math.pow(10, expsign * exp);
};
var LEFT_PARENTHESIS_TOKEN = {
    type: 2 /* TokenType.LEFT_PARENTHESIS_TOKEN */,
};
var RIGHT_PARENTHESIS_TOKEN = {
    type: 3 /* TokenType.RIGHT_PARENTHESIS_TOKEN */,
};
var COMMA_TOKEN = { type: 4 /* TokenType.COMMA_TOKEN */ };
var SUFFIX_MATCH_TOKEN = { type: 13 /* TokenType.SUFFIX_MATCH_TOKEN */ };
var PREFIX_MATCH_TOKEN = { type: 8 /* TokenType.PREFIX_MATCH_TOKEN */ };
var COLUMN_TOKEN = { type: 21 /* TokenType.COLUMN_TOKEN */ };
var DASH_MATCH_TOKEN = { type: 9 /* TokenType.DASH_MATCH_TOKEN */ };
var INCLUDE_MATCH_TOKEN = { type: 10 /* TokenType.INCLUDE_MATCH_TOKEN */ };
var LEFT_CURLY_BRACKET_TOKEN = {
    type: 11 /* TokenType.LEFT_CURLY_BRACKET_TOKEN */,
};
var RIGHT_CURLY_BRACKET_TOKEN = {
    type: 12 /* TokenType.RIGHT_CURLY_BRACKET_TOKEN */,
};
var SUBSTRING_MATCH_TOKEN = { type: 14 /* TokenType.SUBSTRING_MATCH_TOKEN */ };
var BAD_URL_TOKEN = { type: 23 /* TokenType.BAD_URL_TOKEN */ };
var BAD_STRING_TOKEN = { type: 1 /* TokenType.BAD_STRING_TOKEN */ };
var CDO_TOKEN = { type: 25 /* TokenType.CDO_TOKEN */ };
var CDC_TOKEN = { type: 24 /* TokenType.CDC_TOKEN */ };
var COLON_TOKEN = { type: 26 /* TokenType.COLON_TOKEN */ };
var SEMICOLON_TOKEN = { type: 27 /* TokenType.SEMICOLON_TOKEN */ };
var LEFT_SQUARE_BRACKET_TOKEN = {
    type: 28 /* TokenType.LEFT_SQUARE_BRACKET_TOKEN */,
};
var RIGHT_SQUARE_BRACKET_TOKEN = {
    type: 29 /* TokenType.RIGHT_SQUARE_BRACKET_TOKEN */,
};
var WHITESPACE_TOKEN = { type: 31 /* TokenType.WHITESPACE_TOKEN */ };
var EOF_TOKEN = { type: 32 /* TokenType.EOF_TOKEN */ };
var Tokenizer = /** @class */ (function () {
    function Tokenizer() {
        this._value = [];
        this._pos = 0;
    }
    Tokenizer.prototype.write = function (chunk) {
        this._value = this._value.concat(toCodePoints(chunk));
    };
    Tokenizer.prototype.read = function () {
        var tokens = [];
        var token = this.consumeToken();
        while (token !== EOF_TOKEN) {
            tokens.push(token);
            token = this.consumeToken();
        }
        return tokens;
    };
    Tokenizer.prototype.consumeToken = function () {
        var codePoint = this.consumeCodePoint();
        switch (codePoint) {
            case QUOTATION_MARK:
                return this.consumeStringToken(QUOTATION_MARK);
            case NUMBER_SIGN:
                var c1 = this.peekCodePoint(0);
                var c2 = this.peekCodePoint(1);
                var c3 = this.peekCodePoint(2);
                if (isNameCodePoint(c1) || isValidEscape(c2, c3)) {
                    var flags = isIdentifierStart(c1, c2, c3) ? FLAG_ID : FLAG_UNRESTRICTED;
                    var value = this.consumeName();
                    return { type: 5 /* TokenType.HASH_TOKEN */, value: value, flags: flags };
                }
                break;
            case DOLLAR_SIGN:
                if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return SUFFIX_MATCH_TOKEN;
                }
                break;
            case APOSTROPHE:
                return this.consumeStringToken(APOSTROPHE);
            case LEFT_PARENTHESIS:
                return LEFT_PARENTHESIS_TOKEN;
            case RIGHT_PARENTHESIS:
                return RIGHT_PARENTHESIS_TOKEN;
            case ASTERISK:
                if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return SUBSTRING_MATCH_TOKEN;
                }
                break;
            case PLUS_SIGN:
                if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeNumericToken();
                }
                break;
            case COMMA:
                return COMMA_TOKEN;
            case HYPHEN_MINUS:
                var e1 = codePoint;
                var e2 = this.peekCodePoint(0);
                var e3 = this.peekCodePoint(1);
                if (isNumberStart(e1, e2, e3)) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeNumericToken();
                }
                if (isIdentifierStart(e1, e2, e3)) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeIdentLikeToken();
                }
                if (e2 === HYPHEN_MINUS && e3 === GREATER_THAN_SIGN) {
                    this.consumeCodePoint();
                    this.consumeCodePoint();
                    return CDC_TOKEN;
                }
                break;
            case FULL_STOP:
                if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeNumericToken();
                }
                break;
            case SOLIDUS:
                if (this.peekCodePoint(0) === ASTERISK) {
                    this.consumeCodePoint();
                    while (true) {
                        var c = this.consumeCodePoint();
                        if (c === ASTERISK) {
                            c = this.consumeCodePoint();
                            if (c === SOLIDUS) {
                                return this.consumeToken();
                            }
                        }
                        if (c === EOF) {
                            return this.consumeToken();
                        }
                    }
                }
                break;
            case COLON:
                return COLON_TOKEN;
            case SEMICOLON:
                return SEMICOLON_TOKEN;
            case LESS_THAN_SIGN:
                if (this.peekCodePoint(0) === EXCLAMATION_MARK &&
                    this.peekCodePoint(1) === HYPHEN_MINUS &&
                    this.peekCodePoint(2) === HYPHEN_MINUS) {
                    this.consumeCodePoint();
                    this.consumeCodePoint();
                    return CDO_TOKEN;
                }
                break;
            case COMMERCIAL_AT:
                var a1 = this.peekCodePoint(0);
                var a2 = this.peekCodePoint(1);
                var a3 = this.peekCodePoint(2);
                if (isIdentifierStart(a1, a2, a3)) {
                    var value = this.consumeName();
                    return { type: 7 /* TokenType.AT_KEYWORD_TOKEN */, value: value };
                }
                break;
            case LEFT_SQUARE_BRACKET:
                return LEFT_SQUARE_BRACKET_TOKEN;
            case REVERSE_SOLIDUS:
                if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeIdentLikeToken();
                }
                break;
            case RIGHT_SQUARE_BRACKET:
                return RIGHT_SQUARE_BRACKET_TOKEN;
            case CIRCUMFLEX_ACCENT:
                if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return PREFIX_MATCH_TOKEN;
                }
                break;
            case LEFT_CURLY_BRACKET:
                return LEFT_CURLY_BRACKET_TOKEN;
            case RIGHT_CURLY_BRACKET:
                return RIGHT_CURLY_BRACKET_TOKEN;
            case u:
            case U:
                var u1 = this.peekCodePoint(0);
                var u2 = this.peekCodePoint(1);
                if (u1 === PLUS_SIGN && (isHex(u2) || u2 === QUESTION_MARK)) {
                    this.consumeCodePoint();
                    this.consumeUnicodeRangeToken();
                }
                this.reconsumeCodePoint(codePoint);
                return this.consumeIdentLikeToken();
            case VERTICAL_LINE:
                if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return DASH_MATCH_TOKEN;
                }
                if (this.peekCodePoint(0) === VERTICAL_LINE) {
                    this.consumeCodePoint();
                    return COLUMN_TOKEN;
                }
                break;
            case TILDE:
                if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return INCLUDE_MATCH_TOKEN;
                }
                break;
            case EOF:
                return EOF_TOKEN;
        }
        if (isWhiteSpace(codePoint)) {
            this.consumeWhiteSpace();
            return WHITESPACE_TOKEN;
        }
        if (isDigit(codePoint)) {
            this.reconsumeCodePoint(codePoint);
            return this.consumeNumericToken();
        }
        if (isNameStartCodePoint(codePoint)) {
            this.reconsumeCodePoint(codePoint);
            return this.consumeIdentLikeToken();
        }
        return { type: 6 /* TokenType.DELIM_TOKEN */, value: fromCodePoint(codePoint) };
    };
    Tokenizer.prototype.consumeCodePoint = function () {
        if (this._pos >= this._value.length) {
            this._pos++;
            return -1;
        }
        return this._value[this._pos++];
    };
    Tokenizer.prototype.reconsumeCodePoint = function (_codePoint) {
        this._pos--;
    };
    Tokenizer.prototype.peekCodePoint = function (delta) {
        var idx = this._pos + delta;
        if (idx >= this._value.length) {
            return -1;
        }
        return this._value[idx];
    };
    Tokenizer.prototype.consumeUnicodeRangeToken = function () {
        var digits = [];
        var codePoint = this.consumeCodePoint();
        while (isHex(codePoint) && digits.length < 6) {
            digits.push(codePoint);
            codePoint = this.consumeCodePoint();
        }
        var questionMarks = false;
        while (codePoint === QUESTION_MARK && digits.length < 6) {
            digits.push(codePoint);
            codePoint = this.consumeCodePoint();
            questionMarks = true;
        }
        if (questionMarks) {
            var start_1 = parseInt(fromCodePoint.apply(void 0, digits.map(function (digit) { return (digit === QUESTION_MARK ? ZERO : digit); })), 16);
            var end = parseInt(fromCodePoint.apply(void 0, digits.map(function (digit) { return (digit === QUESTION_MARK ? F : digit); })), 16);
            return { type: 30 /* TokenType.UNICODE_RANGE_TOKEN */, start: start_1, end: end };
        }
        var start = parseInt(fromCodePoint.apply(void 0, digits), 16);
        if (this.peekCodePoint(0) === HYPHEN_MINUS && isHex(this.peekCodePoint(1))) {
            this.consumeCodePoint();
            codePoint = this.consumeCodePoint();
            var endDigits = [];
            while (isHex(codePoint) && endDigits.length < 6) {
                endDigits.push(codePoint);
                codePoint = this.consumeCodePoint();
            }
            var end = parseInt(fromCodePoint.apply(void 0, endDigits), 16);
            return { type: 30 /* TokenType.UNICODE_RANGE_TOKEN */, start: start, end: end };
        }
        else {
            return { type: 30 /* TokenType.UNICODE_RANGE_TOKEN */, start: start, end: start };
        }
    };
    Tokenizer.prototype.consumeIdentLikeToken = function () {
        var value = this.consumeName();
        if (value.toLowerCase() === 'url' && this.peekCodePoint(0) === LEFT_PARENTHESIS) {
            this.consumeCodePoint();
            return this.consumeUrlToken();
        }
        else if (this.peekCodePoint(0) === LEFT_PARENTHESIS) {
            this.consumeCodePoint();
            return { type: 19 /* TokenType.FUNCTION_TOKEN */, value: value };
        }
        return { type: 20 /* TokenType.IDENT_TOKEN */, value: value };
    };
    Tokenizer.prototype.consumeUrlToken = function () {
        var value = [];
        this.consumeWhiteSpace();
        if (this.peekCodePoint(0) === EOF) {
            return { type: 22 /* TokenType.URL_TOKEN */, value: '' };
        }
        var next = this.peekCodePoint(0);
        if (next === APOSTROPHE || next === QUOTATION_MARK) {
            var stringToken = this.consumeStringToken(this.consumeCodePoint());
            if (stringToken.type === 0 /* TokenType.STRING_TOKEN */) {
                this.consumeWhiteSpace();
                if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
                    this.consumeCodePoint();
                    return { type: 22 /* TokenType.URL_TOKEN */, value: stringToken.value };
                }
            }
            this.consumeBadUrlRemnants();
            return BAD_URL_TOKEN;
        }
        while (true) {
            var codePoint = this.consumeCodePoint();
            if (codePoint === EOF || codePoint === RIGHT_PARENTHESIS) {
                return { type: 22 /* TokenType.URL_TOKEN */, value: fromCodePoint.apply(void 0, value) };
            }
            else if (isWhiteSpace(codePoint)) {
                this.consumeWhiteSpace();
                if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
                    this.consumeCodePoint();
                    return { type: 22 /* TokenType.URL_TOKEN */, value: fromCodePoint.apply(void 0, value) };
                }
                this.consumeBadUrlRemnants();
                return BAD_URL_TOKEN;
            }
            else if (codePoint === QUOTATION_MARK ||
                codePoint === APOSTROPHE ||
                codePoint === LEFT_PARENTHESIS ||
                isNonPrintableCodePoint(codePoint)) {
                this.consumeBadUrlRemnants();
                return BAD_URL_TOKEN;
            }
            else if (codePoint === REVERSE_SOLIDUS) {
                if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                    value.push(this.consumeEscapedCodePoint());
                }
                else {
                    this.consumeBadUrlRemnants();
                    return BAD_URL_TOKEN;
                }
            }
            else {
                value.push(codePoint);
            }
        }
    };
    Tokenizer.prototype.consumeWhiteSpace = function () {
        while (isWhiteSpace(this.peekCodePoint(0))) {
            this.consumeCodePoint();
        }
    };
    Tokenizer.prototype.consumeBadUrlRemnants = function () {
        while (true) {
            var codePoint = this.consumeCodePoint();
            if (codePoint === RIGHT_PARENTHESIS || codePoint === EOF) {
                return;
            }
            if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                this.consumeEscapedCodePoint();
            }
        }
    };
    Tokenizer.prototype.consumeStringSlice = function (count) {
        var SLICE_STACK_SIZE = 50000;
        var value = '';
        while (count > 0) {
            var amount = Math.min(SLICE_STACK_SIZE, count);
            value += fromCodePoint.apply(void 0, this._value.slice(this._pos, this._pos + amount));
            this._pos += amount;
            count -= amount;
        }
        // Skip the ending code point
        this._pos++;
        return value;
    };
    Tokenizer.prototype.consumeStringToken = function (endingCodePoint) {
        var value = '';
        var i = 0;
        do {
            var codePoint = this._value[this._pos + i];
            if (codePoint === EOF || codePoint === undefined || codePoint === endingCodePoint) {
                value += this.consumeStringSlice(i);
                return { type: 0 /* TokenType.STRING_TOKEN */, value: value };
            }
            if (codePoint === LINE_FEED) {
                this._pos += i;
                return BAD_STRING_TOKEN;
            }
            if (codePoint === REVERSE_SOLIDUS) {
                var next = this._value[this._pos + i + 1];
                if (next !== EOF && next !== undefined) {
                    if (next === LINE_FEED) {
                        value += this.consumeStringSlice(i);
                        i = -1;
                        // Skip the line feed
                        this._pos++;
                    }
                    else if (isValidEscape(codePoint, next)) {
                        value += this.consumeStringSlice(i);
                        value += fromCodePoint(this.consumeEscapedCodePoint());
                        i = -1;
                    }
                }
            }
            i++;
        } while (true);
    };
    Tokenizer.prototype.consumeNumber = function () {
        var repr = [];
        var type = FLAG_INTEGER;
        var c1 = this.peekCodePoint(0);
        if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
            repr.push(this.consumeCodePoint());
        }
        while (isDigit(this.peekCodePoint(0))) {
            repr.push(this.consumeCodePoint());
        }
        c1 = this.peekCodePoint(0);
        var c2 = this.peekCodePoint(1);
        if (c1 === FULL_STOP && isDigit(c2)) {
            repr.push(this.consumeCodePoint(), this.consumeCodePoint());
            type = FLAG_NUMBER;
            while (isDigit(this.peekCodePoint(0))) {
                repr.push(this.consumeCodePoint());
            }
        }
        c1 = this.peekCodePoint(0);
        c2 = this.peekCodePoint(1);
        var c3 = this.peekCodePoint(2);
        if ((c1 === E || c1 === e) && (((c2 === PLUS_SIGN || c2 === HYPHEN_MINUS) && isDigit(c3)) || isDigit(c2))) {
            repr.push(this.consumeCodePoint(), this.consumeCodePoint());
            type = FLAG_NUMBER;
            while (isDigit(this.peekCodePoint(0))) {
                repr.push(this.consumeCodePoint());
            }
        }
        return [stringToNumber(repr), type];
    };
    Tokenizer.prototype.consumeNumericToken = function () {
        var _a = this.consumeNumber(), number = _a[0], flags = _a[1];
        var c1 = this.peekCodePoint(0);
        var c2 = this.peekCodePoint(1);
        var c3 = this.peekCodePoint(2);
        if (isIdentifierStart(c1, c2, c3)) {
            var unit = this.consumeName();
            return { type: 15 /* TokenType.DIMENSION_TOKEN */, number: number, flags: flags, unit: unit };
        }
        if (c1 === PERCENTAGE_SIGN) {
            this.consumeCodePoint();
            return { type: 16 /* TokenType.PERCENTAGE_TOKEN */, number: number, flags: flags };
        }
        return { type: 17 /* TokenType.NUMBER_TOKEN */, number: number, flags: flags };
    };
    Tokenizer.prototype.consumeEscapedCodePoint = function () {
        var codePoint = this.consumeCodePoint();
        if (isHex(codePoint)) {
            var hex = fromCodePoint(codePoint);
            while (isHex(this.peekCodePoint(0)) && hex.length < 6) {
                hex += fromCodePoint(this.consumeCodePoint());
            }
            if (isWhiteSpace(this.peekCodePoint(0))) {
                this.consumeCodePoint();
            }
            var hexCodePoint = parseInt(hex, 16);
            if (hexCodePoint === 0 || isSurrogateCodePoint(hexCodePoint) || hexCodePoint > 0x10ffff) {
                return REPLACEMENT_CHARACTER;
            }
            return hexCodePoint;
        }
        if (codePoint === EOF) {
            return REPLACEMENT_CHARACTER;
        }
        return codePoint;
    };
    Tokenizer.prototype.consumeName = function () {
        var result = '';
        while (true) {
            var codePoint = this.consumeCodePoint();
            if (isNameCodePoint(codePoint)) {
                result += fromCodePoint(codePoint);
            }
            else if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                result += fromCodePoint(this.consumeEscapedCodePoint());
            }
            else {
                this.reconsumeCodePoint(codePoint);
                return result;
            }
        }
    };
    return Tokenizer;
}());

var Parser = /** @class */ (function () {
    function Parser(tokens) {
        this._pos = 0;
        this._tokens = tokens;
    }
    Parser.create = function (value) {
        var tokenizer = new Tokenizer();
        tokenizer.write(value);
        return new Parser(tokenizer.read());
    };
    Parser.parseValue = function (value) {
        return Parser.create(value).parseComponentValue();
    };
    Parser.parseValues = function (value) {
        return Parser.create(value).parseComponentValues();
    };
    Parser.prototype.parseComponentValue = function () {
        var token = this.consumeToken();
        while (token.type === 31 /* TokenType.WHITESPACE_TOKEN */) {
            token = this.consumeToken();
        }
        if (token.type === 32 /* TokenType.EOF_TOKEN */) {
            throw new SyntaxError("Error parsing CSS component value, unexpected EOF");
        }
        this.reconsumeToken(token);
        var value = this.consumeComponentValue();
        do {
            token = this.consumeToken();
        } while (token.type === 31 /* TokenType.WHITESPACE_TOKEN */);
        if (token.type === 32 /* TokenType.EOF_TOKEN */) {
            return value;
        }
        throw new SyntaxError("Error parsing CSS component value, multiple values found when expecting only one");
    };
    Parser.prototype.parseComponentValues = function () {
        var values = [];
        while (true) {
            var value = this.consumeComponentValue();
            if (value.type === 32 /* TokenType.EOF_TOKEN */) {
                return values;
            }
            values.push(value);
            values.push();
        }
    };
    Parser.prototype.consumeComponentValue = function () {
        var token = this.consumeToken();
        switch (token.type) {
            case 11 /* TokenType.LEFT_CURLY_BRACKET_TOKEN */:
            case 28 /* TokenType.LEFT_SQUARE_BRACKET_TOKEN */:
            case 2 /* TokenType.LEFT_PARENTHESIS_TOKEN */:
                return this.consumeSimpleBlock(token.type);
            case 19 /* TokenType.FUNCTION_TOKEN */:
                return this.consumeFunction(token);
        }
        return token;
    };
    Parser.prototype.consumeSimpleBlock = function (type) {
        var block = { type: type, values: [] };
        var token = this.consumeToken();
        while (true) {
            if (token.type === 32 /* TokenType.EOF_TOKEN */ || isEndingTokenFor(token, type)) {
                return block;
            }
            this.reconsumeToken(token);
            block.values.push(this.consumeComponentValue());
            token = this.consumeToken();
        }
    };
    Parser.prototype.consumeFunction = function (functionToken) {
        var cssFunction = {
            name: functionToken.value,
            values: [],
            type: 18 /* TokenType.FUNCTION */,
        };
        while (true) {
            var token = this.consumeToken();
            if (token.type === 32 /* TokenType.EOF_TOKEN */ || token.type === 3 /* TokenType.RIGHT_PARENTHESIS_TOKEN */) {
                return cssFunction;
            }
            this.reconsumeToken(token);
            cssFunction.values.push(this.consumeComponentValue());
        }
    };
    Parser.prototype.consumeToken = function () {
        if (this._pos >= this._tokens.length) {
            return EOF_TOKEN;
        }
        return this._tokens[this._pos++];
    };
    Parser.prototype.reconsumeToken = function (_token) {
        this._pos--;
    };
    return Parser;
}());
var isDimensionToken = function (token) { return token.type === 15 /* TokenType.DIMENSION_TOKEN */; };
var isNumberToken = function (token) { return token.type === 17 /* TokenType.NUMBER_TOKEN */; };
var isIdentToken = function (token) { return token.type === 20 /* TokenType.IDENT_TOKEN */; };
var isStringToken = function (token) { return token.type === 0 /* TokenType.STRING_TOKEN */; };
var isIdentWithValue = function (token, value) {
    return isIdentToken(token) && token.value === value;
};
var nonWhiteSpace = function (token) { return token.type !== 31 /* TokenType.WHITESPACE_TOKEN */; };
var nonFunctionArgSeparator = function (token) {
    return token.type !== 31 /* TokenType.WHITESPACE_TOKEN */ &&
        token.type !== 4 /* TokenType.COMMA_TOKEN */ &&
        token.type !== 6 /* TokenType.DELIM_TOKEN */;
};
var parseFunctionArgs = function (tokens) {
    var args = [];
    var arg = [];
    tokens.forEach(function (token) {
        if (token.type === 4 /* TokenType.COMMA_TOKEN */) {
            if (arg.length === 0) {
                throw new Error("Error parsing function args, zero tokens for arg");
            }
            args.push(arg);
            arg = [];
            return;
        }
        if (token.type !== 31 /* TokenType.WHITESPACE_TOKEN */) {
            arg.push(token);
        }
    });
    if (arg.length) {
        args.push(arg);
    }
    return args;
};
var isEndingTokenFor = function (token, type) {
    if (type === 11 /* TokenType.LEFT_CURLY_BRACKET_TOKEN */ && token.type === 12 /* TokenType.RIGHT_CURLY_BRACKET_TOKEN */) {
        return true;
    }
    if (type === 28 /* TokenType.LEFT_SQUARE_BRACKET_TOKEN */ && token.type === 29 /* TokenType.RIGHT_SQUARE_BRACKET_TOKEN */) {
        return true;
    }
    return type === 2 /* TokenType.LEFT_PARENTHESIS_TOKEN */ && token.type === 3 /* TokenType.RIGHT_PARENTHESIS_TOKEN */;
};

var parseBlendMode = function (value) {
    switch (value) {
        case 'multiply':
            return "multiply" /* BACKGROUND_BLEND_MODE.MULTIPLY */;
        case 'screen':
            return "screen" /* BACKGROUND_BLEND_MODE.SCREEN */;
        case 'overlay':
            return "overlay" /* BACKGROUND_BLEND_MODE.OVERLAY */;
        case 'darken':
            return "darken" /* BACKGROUND_BLEND_MODE.DARKEN */;
        case 'lighten':
            return "lighten" /* BACKGROUND_BLEND_MODE.LIGHTEN */;
        case 'color-dodge':
            return "color-dodge" /* BACKGROUND_BLEND_MODE.COLOR_DODGE */;
        case 'color-burn':
            return "color-burn" /* BACKGROUND_BLEND_MODE.COLOR_BURN */;
        case 'hard-light':
            return "hard-light" /* BACKGROUND_BLEND_MODE.HARD_LIGHT */;
        case 'soft-light':
            return "soft-light" /* BACKGROUND_BLEND_MODE.SOFT_LIGHT */;
        case 'difference':
            return "difference" /* BACKGROUND_BLEND_MODE.DIFFERENCE */;
        case 'exclusion':
            return "exclusion" /* BACKGROUND_BLEND_MODE.EXCLUSION */;
        case 'hue':
            return "hue" /* BACKGROUND_BLEND_MODE.HUE */;
        case 'saturation':
            return "saturation" /* BACKGROUND_BLEND_MODE.SATURATION */;
        case 'color':
            return "color" /* BACKGROUND_BLEND_MODE.COLOR */;
        case 'luminosity':
            return "luminosity" /* BACKGROUND_BLEND_MODE.LUMINOSITY */;
        case 'normal':
        default:
            return "source-over" /* BACKGROUND_BLEND_MODE.NORMAL */;
    }
};
var backgroundBlendMode = {
    name: 'background-blend-mode',
    initialValue: 'normal',
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    prefix: false,
    parse: function (_context, tokens) {
        var modes = [];
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            if (isIdentToken(token)) {
                modes.push(parseBlendMode(token.value));
            }
            else if (token.type === 4 /* TokenType.COMMA_TOKEN */) ;
        }
        return modes.length ? modes : ["source-over" /* BACKGROUND_BLEND_MODE.NORMAL */];
    },
};

var backgroundClip = {
    name: 'background-clip',
    initialValue: 'border-box',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        return tokens.map(function (token) {
            if (isIdentToken(token)) {
                switch (token.value) {
                    case 'padding-box':
                        return 1 /* BACKGROUND_CLIP.PADDING_BOX */;
                    case 'content-box':
                        return 2 /* BACKGROUND_CLIP.CONTENT_BOX */;
                    case 'text':
                    case '-webkit-text':
                        return 3 /* BACKGROUND_CLIP.TEXT */;
                }
            }
            return 0 /* BACKGROUND_CLIP.BORDER_BOX */;
        });
    },
};

var backgroundColor = {
    name: "background-color",
    initialValue: 'transparent',
    prefix: false,
    type: 3 /* PropertyDescriptorParsingType.TYPE_VALUE */,
    format: 'color',
};

var isLength = function (token) {
    return token.type === 17 /* TokenType.NUMBER_TOKEN */ || token.type === 15 /* TokenType.DIMENSION_TOKEN */;
};

var isLengthPercentage = function (token) {
    return token.type === 16 /* TokenType.PERCENTAGE_TOKEN */ || isLength(token) || isCalcFunction(token);
};
var isCalcFunction = function (token) {
    return token.type === 18 /* TokenType.FUNCTION */ && token.name === 'calc';
};
var parseLengthPercentageTuple = function (tokens) {
    return tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
};
var ZERO_LENGTH = {
    type: 17 /* TokenType.NUMBER_TOKEN */,
    number: 0,
    flags: FLAG_INTEGER,
};
var FIFTY_PERCENT = {
    type: 16 /* TokenType.PERCENTAGE_TOKEN */,
    number: 50,
    flags: FLAG_INTEGER,
};
var HUNDRED_PERCENT = {
    type: 16 /* TokenType.PERCENTAGE_TOKEN */,
    number: 100,
    flags: FLAG_INTEGER,
};
var getAbsoluteValueForTuple = function (tuple, width, height) {
    var x = tuple[0], y = tuple[1];
    return [getAbsoluteValue(x, width), getAbsoluteValue(typeof y !== 'undefined' ? y : x, height)];
};
/**
 * Returns the raw numeric value of a LengthPercentage token.
 * For simple tokens this is `token.number`, for calc() it evaluates with a parent of 0
 * (meaning percentages resolve to 0 — use getAbsoluteValue for percentage-aware resolution).
 */
var getNumber = function (token) {
    if (token.type === 18 /* TokenType.FUNCTION */) {
        return evaluateCalc(token.values, 0);
    }
    return token.number;
};
var getAbsoluteValue = function (token, parent) {
    if (token.type === 16 /* TokenType.PERCENTAGE_TOKEN */) {
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
    if (token.type === 18 /* TokenType.FUNCTION */) {
        return evaluateCalc(token.values, parent);
    }
    return token.number;
};
/**
 * Evaluates a calc() expression given the parsed token values.
 * Supports +, -, *, / operators and nested calc().
 * Percentages are resolved relative to `parent`.
 */
var evaluateCalc = function (values, parent) {
    // Flatten tokens, ignoring whitespace
    var tokens = values.filter(function (t) { return t.type !== 31 /* TokenType.WHITESPACE_TOKEN */; });
    return evaluateExpression(tokens, 0, parent).value;
};
/**
 * Simple recursive-descent expression evaluator for calc() contents.
 * Grammar: expression = term (('+' | '-') term)*
 *          term = factor (('*' | '/') factor)*
 *          factor = number | percentage | dimension | '(' expression ')' | calc(expression)
 */
var evaluateExpression = function (tokens, startIndex, parent) {
    var _a = evaluateTerm(tokens, startIndex, parent), value = _a.value, index = _a.index;
    while (index < tokens.length) {
        var op = tokens[index];
        if (op.type === 6 /* TokenType.DELIM_TOKEN */ && (op.value === '+' || op.value === '-')) {
            var right = evaluateTerm(tokens, index + 1, parent);
            value = op.value === '+' ? value + right.value : value - right.value;
            index = right.index;
        }
        else {
            break;
        }
    }
    return { value: value, index: index };
};
var evaluateTerm = function (tokens, startIndex, parent) {
    var _a = evaluateFactor(tokens, startIndex, parent), value = _a.value, index = _a.index;
    while (index < tokens.length) {
        var op = tokens[index];
        if (op.type === 6 /* TokenType.DELIM_TOKEN */ && (op.value === '*' || op.value === '/')) {
            var right = evaluateFactor(tokens, index + 1, parent);
            value = op.value === '*' ? value * right.value : value / right.value;
            index = right.index;
        }
        else {
            break;
        }
    }
    return { value: value, index: index };
};
var evaluateFactor = function (tokens, index, parent) {
    if (index >= tokens.length) {
        return { value: 0, index: index };
    }
    var token = tokens[index];
    // Nested calc()
    if (token.type === 18 /* TokenType.FUNCTION */ && token.name === 'calc') {
        var result = evaluateCalc(token.values, parent);
        return { value: result, index: index + 1 };
    }
    // Parenthesized sub-expression
    if (token.type === 2 /* TokenType.LEFT_PARENTHESIS_TOKEN */) {
        // Find matching right paren and evaluate contents
        var _a = evaluateExpression(tokens, index + 1, parent), value = _a.value, endIndex = _a.index;
        // Skip the right parenthesis
        return { value: value, index: endIndex + 1 };
    }
    // Percentage
    if (token.type === 16 /* TokenType.PERCENTAGE_TOKEN */) {
        return { value: (token.number / 100) * parent, index: index + 1 };
    }
    // Dimension (px, em, rem, etc.)
    if (isDimensionToken(token)) {
        var val = void 0;
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
        return { value: val, index: index + 1 };
    }
    // Plain number
    if (token.type === 17 /* TokenType.NUMBER_TOKEN */) {
        return { value: token.number, index: index + 1 };
    }
    // Unrecognized token — skip it
    return { value: 0, index: index + 1 };
};

var DEG = 'deg';
var GRAD = 'grad';
var RAD = 'rad';
var TURN = 'turn';
var angle = {
    name: 'angle',
    parse: function (_context, value) {
        if (value.type === 15 /* TokenType.DIMENSION_TOKEN */) {
            switch (value.unit) {
                case DEG:
                    return (Math.PI * value.number) / 180;
                case GRAD:
                    return (Math.PI / 200) * value.number;
                case RAD:
                    return value.number;
                case TURN:
                    return Math.PI * 2 * value.number;
            }
        }
        throw new Error("Unsupported angle type");
    },
};
var isAngle = function (value) {
    if (value.type === 15 /* TokenType.DIMENSION_TOKEN */) {
        if (value.unit === DEG || value.unit === GRAD || value.unit === RAD || value.unit === TURN) {
            return true;
        }
    }
    return false;
};
var parseNamedSide = function (tokens) {
    var sideOrCorner = tokens
        .filter(isIdentToken)
        .map(function (ident) { return ident.value; })
        .join(' ');
    switch (sideOrCorner) {
        case 'to bottom right':
        case 'to right bottom':
        case 'left top':
        case 'top left':
            return [ZERO_LENGTH, ZERO_LENGTH];
        case 'to top':
        case 'bottom':
            return deg(0);
        case 'to bottom left':
        case 'to left bottom':
        case 'right top':
        case 'top right':
            return [ZERO_LENGTH, HUNDRED_PERCENT];
        case 'to right':
        case 'left':
            return deg(90);
        case 'to top left':
        case 'to left top':
        case 'right bottom':
        case 'bottom right':
            return [HUNDRED_PERCENT, HUNDRED_PERCENT];
        case 'to bottom':
        case 'top':
            return deg(180);
        case 'to top right':
        case 'to right top':
        case 'left bottom':
        case 'bottom left':
            return [HUNDRED_PERCENT, ZERO_LENGTH];
        case 'to left':
        case 'right':
            return deg(270);
    }
    return 0;
};
var deg = function (deg) { return (Math.PI * deg) / 180; };

/**
 * Minimal colorjs.io setup — only registers the color spaces needed by html2canvas.
 * This avoids bundling all 54 color spaces (~700KB unminified).
 *
 * Registered spaces: sRGB, sRGB-linear, HSL, HWB, Lab, LCH, OKLab, OKLCH,
 * Display P3, Rec.2020, XYZ-D65, XYZ-D50 (needed for gamut mapping and conversions).
 */
// Core Color class without any spaces pre-registered
// Register only the spaces we need
ColorSpace.register(sRGB);
ColorSpace.register(sRGB_Linear);
ColorSpace.register(HSL);
ColorSpace.register(HWB);
ColorSpace.register(Lab);
ColorSpace.register(LCH);
ColorSpace.register(OKLab);
ColorSpace.register(OKLCH);
ColorSpace.register(P3);
ColorSpace.register(P3_Linear);
ColorSpace.register(REC_2020);
ColorSpace.register(REC_2020_Linear);
ColorSpace.register(XYZ_D65);
ColorSpace.register(XYZ_D50);
ColorSpace.register(Lab_D65);
Color.extend(interpolation);

var color$1 = {
    name: 'color',
    parse: function (context, value) {
        if (value.type === 18 /* TokenType.FUNCTION */) {
            var colorFunction_1 = SUPPORTED_COLOR_FUNCTIONS[value.name];
            if (typeof colorFunction_1 === 'undefined') {
                // Fallback to colorjs.io for unsupported color functions
                var raw = reconstructFunctionString(value);
                return parseWithColorJs(raw);
            }
            return colorFunction_1(context, value.values);
        }
        if (value.type === 5 /* TokenType.HASH_TOKEN */) {
            if (value.value.length === 3) {
                var r = value.value.substring(0, 1);
                var g = value.value.substring(1, 2);
                var b = value.value.substring(2, 3);
                return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), 1);
            }
            if (value.value.length === 4) {
                var r = value.value.substring(0, 1);
                var g = value.value.substring(1, 2);
                var b = value.value.substring(2, 3);
                var a = value.value.substring(3, 4);
                return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), parseInt(a + a, 16) / 255);
            }
            if (value.value.length === 6) {
                var r = value.value.substring(0, 2);
                var g = value.value.substring(2, 4);
                var b = value.value.substring(4, 6);
                return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), 1);
            }
            if (value.value.length === 8) {
                var r = value.value.substring(0, 2);
                var g = value.value.substring(2, 4);
                var b = value.value.substring(4, 6);
                var a = value.value.substring(6, 8);
                return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), parseInt(a, 16) / 255);
            }
        }
        if (value.type === 20 /* TokenType.IDENT_TOKEN */) {
            var namedColor = COLORS[value.value.toUpperCase()];
            if (typeof namedColor !== 'undefined') {
                return namedColor;
            }
        }
        return COLORS.TRANSPARENT;
    },
};
var isTransparent = function (color) { return (0xff & color) === 0; };
var asString = function (color) {
    var alpha = 0xff & color;
    var blue = 0xff & (color >> 8);
    var green = 0xff & (color >> 16);
    var red = 0xff & (color >> 24);
    return alpha < 255 ? "rgba(".concat(red, ",").concat(green, ",").concat(blue, ",").concat(alpha / 255, ")") : "rgb(".concat(red, ",").concat(green, ",").concat(blue, ")");
};
var pack = function (r, g, b, a) {
    return ((r << 24) | (g << 16) | (b << 8) | (Math.round(a * 255) << 0)) >>> 0;
};
/**
 * Converts a colorjs.io Color instance to a packed uint32 color.
 * The color is gamut-mapped to sRGB before packing.
 */
var colorJsToPacked = function (c) {
    var srgb = c.toGamut({ space: 'srgb' }).to('srgb');
    var r = Math.round(Math.min(255, Math.max(0, (srgb.coords[0] || 0) * 255)));
    var g = Math.round(Math.min(255, Math.max(0, (srgb.coords[1] || 0) * 255)));
    var b = Math.round(Math.min(255, Math.max(0, (srgb.coords[2] || 0) * 255)));
    var a = srgb.alpha;
    return pack(r, g, b, a);
};
/**
 * Parses a raw CSS color string using colorjs.io and returns the packed uint32 representation.
 */
var parseWithColorJs = function (raw) {
    try {
        var c = new Color(raw);
        return colorJsToPacked(c);
    }
    catch (_a) {
        return COLORS.TRANSPARENT;
    }
};
/**
 * Reconstructs a CSS function string from parsed CSSValue tokens.
 * Used to pass unsupported color functions to colorjs.io.
 */
var reconstructFunctionString = function (value) {
    if (value.type === 18 /* TokenType.FUNCTION */) {
        var args = value.values.map(function (v) { return reconstructToken(v); }).join('');
        return "".concat(value.name, "(").concat(args, ")");
    }
    return reconstructToken(value);
};
var reconstructToken = function (token) {
    switch (token.type) {
        case 17 /* TokenType.NUMBER_TOKEN */:
            return String(token.number);
        case 16 /* TokenType.PERCENTAGE_TOKEN */:
            return "".concat(token.number, "%");
        case 15 /* TokenType.DIMENSION_TOKEN */:
            return "".concat(token.number).concat(token.unit);
        case 5 /* TokenType.HASH_TOKEN */:
            return "#".concat(token.value);
        case 20 /* TokenType.IDENT_TOKEN */:
        case 0 /* TokenType.STRING_TOKEN */:
        case 6 /* TokenType.DELIM_TOKEN */:
            return token.value;
        case 31 /* TokenType.WHITESPACE_TOKEN */:
            return ' ';
        case 4 /* TokenType.COMMA_TOKEN */:
            return ', ';
        case 18 /* TokenType.FUNCTION */:
            return reconstructFunctionString(token);
        default:
            return '';
    }
};
var getTokenColorValue = function (token, i) {
    if (token.type === 17 /* TokenType.NUMBER_TOKEN */) {
        return token.number;
    }
    if (token.type === 16 /* TokenType.PERCENTAGE_TOKEN */) {
        var max = i === 3 ? 1 : 255;
        return i === 3 ? (token.number / 100) * max : Math.round((token.number / 100) * max);
    }
    return 0;
};
var rgb = function (_context, args) {
    var tokens = args.filter(nonFunctionArgSeparator);
    if (tokens.length === 3) {
        var _a = tokens.map(getTokenColorValue), r = _a[0], g = _a[1], b = _a[2];
        return pack(r, g, b, 1);
    }
    if (tokens.length === 4) {
        var _b = tokens.map(getTokenColorValue), r = _b[0], g = _b[1], b = _b[2], a = _b[3];
        return pack(r, g, b, a);
    }
    return 0;
};
/**
 * Delegates color function parsing to colorjs.io by reconstructing the CSS string from tokens.
 * Preserves all tokens (including '/' delimiters for alpha) to maintain correct CSS syntax.
 */
var delegateToColorJs = function (functionName, args) {
    var raw = functionName + '(' + args.map(function (t) { return reconstructToken(t); }).join('') + ')';
    return parseWithColorJs(raw);
};
var hsl = function (_context, args) { return delegateToColorJs('hsl', args); };
var hwb = function (_context, args) { return delegateToColorJs('hwb', args); };
var lch = function (_context, args) { return delegateToColorJs('lch', args); };
var lab = function (_context, args) { return delegateToColorJs('lab', args); };
var oklch = function (_context, args) { return delegateToColorJs('oklch', args); };
var oklab = function (_context, args) { return delegateToColorJs('oklab', args); };
var colorFunction = function (_context, args) { return delegateToColorJs('color', args); };
/**
 * Parses `color-mix(in <space>, <color1> <pct1>%, <color2> <pct2>%)`.
 * colorjs.io doesn't support parsing color-mix as a string, so we parse the arguments
 * manually and use Color.mix().
 */
var colorMix = function (_context, args) {
    // color-mix args structure: in <space> , <color1-tokens> <pct>% , <color2-tokens> <pct>%
    // After tokenization, commas are COMMA_TOKEN. We split by commas.
    var groups = [[]];
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var token = args_1[_i];
        if (token.type === 4 /* TokenType.COMMA_TOKEN */) {
            groups.push([]);
        }
        else {
            groups[groups.length - 1].push(token);
        }
    }
    // We expect 3 groups: [in <space>], [<color1> <pct>%], [<color2> <pct>%?]
    if (groups.length < 3) {
        return COLORS.TRANSPARENT;
    }
    try {
        // Parse interpolation space from first group (skip "in" keyword)
        var spaceTokens = groups[0].filter(function (t) { return t.type !== 31 /* TokenType.WHITESPACE_TOKEN */; });
        var inKeyword = spaceTokens[0];
        if (!inKeyword || inKeyword.type !== 20 /* TokenType.IDENT_TOKEN */ || inKeyword.value !== 'in') {
            return COLORS.TRANSPARENT;
        }
        var spaceToken = spaceTokens[1];
        if (!spaceToken || spaceToken.type !== 20 /* TokenType.IDENT_TOKEN */) {
            return COLORS.TRANSPARENT;
        }
        var space = spaceToken.value;
        // Parse color1 + percentage from second group
        var _a = extractColorAndPercentage(groups[1]), color1Str = _a.colorStr, pct1 = _a.percentage;
        // Parse color2 + percentage from third group
        var _b = extractColorAndPercentage(groups[2]), color2Str = _b.colorStr, pct2 = _b.percentage;
        var p1 = pct1 !== null ? pct1 / 100 : pct2 !== null ? 1 - pct2 / 100 : 0.5;
        var c1 = new Color(color1Str);
        var c2 = new Color(color2Str);
        var mixed = Color.mix(c1, c2, 1 - p1, { space: space });
        return colorJsToPacked(mixed);
    }
    catch (_c) {
        return COLORS.TRANSPARENT;
    }
};
/**
 * Extracts a color string and an optional trailing percentage from a group of tokens.
 * e.g. tokens for "hsl(120 100% 50%) 25%" → { colorStr: "hsl(120 100% 50%)", percentage: 25 }
 */
var extractColorAndPercentage = function (tokens) {
    // Check if the last non-whitespace token is a percentage
    var nonWs = tokens.filter(function (t) { return t.type !== 31 /* TokenType.WHITESPACE_TOKEN */; });
    var lastToken = nonWs[nonWs.length - 1];
    var percentage = null;
    var colorTokens = tokens;
    if (lastToken && lastToken.type === 16 /* TokenType.PERCENTAGE_TOKEN */) {
        percentage = lastToken.number;
        // Remove the trailing percentage (and any whitespace before it) from the color tokens
        var lastIndex = tokens.lastIndexOf(lastToken);
        colorTokens = tokens.slice(0, lastIndex);
    }
    var colorStr = colorTokens
        .map(function (t) { return reconstructToken(t); })
        .join('')
        .trim();
    return { colorStr: colorStr, percentage: percentage };
};
var SUPPORTED_COLOR_FUNCTIONS = {
    hsl: hsl,
    hsla: hsl,
    rgb: rgb,
    rgba: rgb,
    lch: lch,
    lab: lab,
    oklch: oklch,
    oklab: oklab,
    hwb: hwb,
    color: colorFunction,
    'color-mix': colorMix,
};
var parseColor = function (context, value) {
    return color$1.parse(context, Parser.create(value).parseComponentValue());
};
var COLORS = {
    ALICEBLUE: 0xf0f8ffff,
    ANTIQUEWHITE: 0xfaebd7ff,
    AQUA: 0x00ffffff,
    AQUAMARINE: 0x7fffd4ff,
    AZURE: 0xf0ffffff,
    BEIGE: 0xf5f5dcff,
    BISQUE: 0xffe4c4ff,
    BLACK: 0x000000ff,
    BLANCHEDALMOND: 0xffebcdff,
    BLUE: 0x0000ffff,
    BLUEVIOLET: 0x8a2be2ff,
    BROWN: 0xa52a2aff,
    BURLYWOOD: 0xdeb887ff,
    CADETBLUE: 0x5f9ea0ff,
    CHARTREUSE: 0x7fff00ff,
    CHOCOLATE: 0xd2691eff,
    CORAL: 0xff7f50ff,
    CORNFLOWERBLUE: 0x6495edff,
    CORNSILK: 0xfff8dcff,
    CRIMSON: 0xdc143cff,
    CYAN: 0x00ffffff,
    DARKBLUE: 0x00008bff,
    DARKCYAN: 0x008b8bff,
    DARKGOLDENROD: 0xb886bbff,
    DARKGRAY: 0xa9a9a9ff,
    DARKGREEN: 0x006400ff,
    DARKGREY: 0xa9a9a9ff,
    DARKKHAKI: 0xbdb76bff,
    DARKMAGENTA: 0x8b008bff,
    DARKOLIVEGREEN: 0x556b2fff,
    DARKORANGE: 0xff8c00ff,
    DARKORCHID: 0x9932ccff,
    DARKRED: 0x8b0000ff,
    DARKSALMON: 0xe9967aff,
    DARKSEAGREEN: 0x8fbc8fff,
    DARKSLATEBLUE: 0x483d8bff,
    DARKSLATEGRAY: 0x2f4f4fff,
    DARKSLATEGREY: 0x2f4f4fff,
    DARKTURQUOISE: 0x00ced1ff,
    DARKVIOLET: 0x9400d3ff,
    DEEPPINK: 0xff1493ff,
    DEEPSKYBLUE: 0x00bfffff,
    DIMGRAY: 0x696969ff,
    DIMGREY: 0x696969ff,
    DODGERBLUE: 0x1e90ffff,
    FIREBRICK: 0xb22222ff,
    FLORALWHITE: 0xfffaf0ff,
    FORESTGREEN: 0x228b22ff,
    FUCHSIA: 0xff00ffff,
    GAINSBORO: 0xdcdcdcff,
    GHOSTWHITE: 0xf8f8ffff,
    GOLD: 0xffd700ff,
    GOLDENROD: 0xdaa520ff,
    GRAY: 0x808080ff,
    GREEN: 0x008000ff,
    GREENYELLOW: 0xadff2fff,
    GREY: 0x808080ff,
    HONEYDEW: 0xf0fff0ff,
    HOTPINK: 0xff69b4ff,
    INDIANRED: 0xcd5c5cff,
    INDIGO: 0x4b0082ff,
    IVORY: 0xfffff0ff,
    KHAKI: 0xf0e68cff,
    LAVENDER: 0xe6e6faff,
    LAVENDERBLUSH: 0xfff0f5ff,
    LAWNGREEN: 0x7cfc00ff,
    LEMONCHIFFON: 0xfffacdff,
    LIGHTBLUE: 0xadd8e6ff,
    LIGHTCORAL: 0xf08080ff,
    LIGHTCYAN: 0xe0ffffff,
    LIGHTGOLDENRODYELLOW: 0xfafad2ff,
    LIGHTGRAY: 0xd3d3d3ff,
    LIGHTGREEN: 0x90ee90ff,
    LIGHTGREY: 0xd3d3d3ff,
    LIGHTPINK: 0xffb6c1ff,
    LIGHTSALMON: 0xffa07aff,
    LIGHTSEAGREEN: 0x20b2aaff,
    LIGHTSKYBLUE: 0x87cefaff,
    LIGHTSLATEGRAY: 0x778899ff,
    LIGHTSLATEGREY: 0x778899ff,
    LIGHTSTEELBLUE: 0xb0c4deff,
    LIGHTYELLOW: 0xffffe0ff,
    LIME: 0x00ff00ff,
    LIMEGREEN: 0x32cd32ff,
    LINEN: 0xfaf0e6ff,
    MAGENTA: 0xff00ffff,
    MAROON: 0x800000ff,
    MEDIUMAQUAMARINE: 0x66cdaaff,
    MEDIUMBLUE: 0x0000cdff,
    MEDIUMORCHID: 0xba55d3ff,
    MEDIUMPURPLE: 0x9370dbff,
    MEDIUMSEAGREEN: 0x3cb371ff,
    MEDIUMSLATEBLUE: 0x7b68eeff,
    MEDIUMSPRINGGREEN: 0x00fa9aff,
    MEDIUMTURQUOISE: 0x48d1ccff,
    MEDIUMVIOLETRED: 0xc71585ff,
    MIDNIGHTBLUE: 0x191970ff,
    MINTCREAM: 0xf5fffaff,
    MISTYROSE: 0xffe4e1ff,
    MOCCASIN: 0xffe4b5ff,
    NAVAJOWHITE: 0xffdeadff,
    NAVY: 0x000080ff,
    OLDLACE: 0xfdf5e6ff,
    OLIVE: 0x808000ff,
    OLIVEDRAB: 0x6b8e23ff,
    ORANGE: 0xffa500ff,
    ORANGERED: 0xff4500ff,
    ORCHID: 0xda70d6ff,
    PALEGOLDENROD: 0xeee8aaff,
    PALEGREEN: 0x98fb98ff,
    PALETURQUOISE: 0xafeeeeff,
    PALEVIOLETRED: 0xdb7093ff,
    PAPAYAWHIP: 0xffefd5ff,
    PEACHPUFF: 0xffdab9ff,
    PERU: 0xcd853fff,
    PINK: 0xffc0cbff,
    PLUM: 0xdda0ddff,
    POWDERBLUE: 0xb0e0e6ff,
    PURPLE: 0x800080ff,
    REBECCAPURPLE: 0x663399ff,
    RED: 0xff0000ff,
    ROSYBROWN: 0xbc8f8fff,
    ROYALBLUE: 0x4169e1ff,
    SADDLEBROWN: 0x8b4513ff,
    SALMON: 0xfa8072ff,
    SANDYBROWN: 0xf4a460ff,
    SEAGREEN: 0x2e8b57ff,
    SEASHELL: 0xfff5eeff,
    SIENNA: 0xa0522dff,
    SILVER: 0xc0c0c0ff,
    SKYBLUE: 0x87ceebff,
    SLATEBLUE: 0x6a5acdff,
    SLATEGRAY: 0x708090ff,
    SLATEGREY: 0x708090ff,
    SNOW: 0xfffafaff,
    SPRINGGREEN: 0x00ff7fff,
    STEELBLUE: 0x4682b4ff,
    TAN: 0xd2b48cff,
    TEAL: 0x008080ff,
    THISTLE: 0xd8bfd8ff,
    TOMATO: 0xff6347ff,
    TRANSPARENT: 0x00000000,
    TURQUOISE: 0x40e0d0ff,
    VIOLET: 0xee82eeff,
    WHEAT: 0xf5deb3ff,
    WHITE: 0xffffffff,
    WHITESMOKE: 0xf5f5f5ff,
    YELLOW: 0xffff00ff,
    YELLOWGREEN: 0x9acd32ff,
};

var parseColorStop = function (context, args) {
    var color = color$1.parse(context, args[0]);
    var stop = args[1];
    return stop && isLengthPercentage(stop) ? { color: color, stop: stop } : { color: color, stop: null };
};
var processColorStops = function (stops, lineLength) {
    var first = stops[0];
    var last = stops[stops.length - 1];
    if (first.stop === null) {
        first.stop = ZERO_LENGTH;
    }
    if (last.stop === null) {
        last.stop = HUNDRED_PERCENT;
    }
    var processStops = [];
    var previous = 0;
    for (var i = 0; i < stops.length; i++) {
        var stop_1 = stops[i].stop;
        if (stop_1 !== null) {
            var absoluteValue = getAbsoluteValue(stop_1, lineLength);
            if (absoluteValue > previous) {
                processStops.push(absoluteValue);
            }
            else {
                processStops.push(previous);
            }
            previous = absoluteValue;
        }
        else {
            processStops.push(null);
        }
    }
    var gapBegin = null;
    for (var i = 0; i < processStops.length; i++) {
        var stop_2 = processStops[i];
        if (stop_2 === null) {
            if (gapBegin === null) {
                gapBegin = i;
            }
        }
        else if (gapBegin !== null) {
            var gapLength = i - gapBegin;
            var beforeGap = processStops[gapBegin - 1];
            var gapValue = (stop_2 - beforeGap) / (gapLength + 1);
            for (var g = 1; g <= gapLength; g++) {
                processStops[gapBegin + g - 1] = gapValue * g;
            }
            gapBegin = null;
        }
    }
    return stops.map(function (_a, i) {
        var color = _a.color;
        return { color: color, stop: Math.max(Math.min(1, processStops[i] / lineLength), 0) };
    });
};
var getAngleFromCorner = function (corner, width, height) {
    var centerX = width / 2;
    var centerY = height / 2;
    var x = getAbsoluteValue(corner[0], width) - centerX;
    var y = centerY - getAbsoluteValue(corner[1], height);
    return (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
};
var calculateGradientDirection = function (angle, width, height) {
    var radian = typeof angle === 'number' ? angle : getAngleFromCorner(angle, width, height);
    var lineLength = Math.abs(width * Math.sin(radian)) + Math.abs(height * Math.cos(radian));
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    var halfLineLength = lineLength / 2;
    var yDiff = Math.sin(radian - Math.PI / 2) * halfLineLength;
    var xDiff = Math.cos(radian - Math.PI / 2) * halfLineLength;
    return [lineLength, halfWidth - xDiff, halfWidth + xDiff, halfHeight - yDiff, halfHeight + yDiff];
};
var distance = function (a, b) { return Math.sqrt(a * a + b * b); };
var findCorner = function (width, height, x, y, closest) {
    var corners = [
        [0, 0],
        [0, height],
        [width, 0],
        [width, height],
    ];
    return corners.reduce(function (stat, corner) {
        var cx = corner[0], cy = corner[1];
        var d = distance(x - cx, y - cy);
        if (closest ? d < stat.optimumDistance : d > stat.optimumDistance) {
            return {
                optimumCorner: corner,
                optimumDistance: d,
            };
        }
        return stat;
    }, {
        optimumDistance: closest ? Infinity : -Infinity,
        optimumCorner: null,
    }).optimumCorner;
};
var calculateRadius = function (gradient, x, y, width, height) {
    var rx = 0;
    var ry = 0;
    switch (gradient.size) {
        case 0 /* CSSRadialExtent.CLOSEST_SIDE */:
            // The ending shape is sized so that that it exactly meets the side of the gradient box closest to the gradient’s center.
            // If the shape is an ellipse, it exactly meets the closest side in each dimension.
            if (gradient.shape === 0 /* CSSRadialShape.CIRCLE */) {
                rx = ry = Math.min(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
            }
            else if (gradient.shape === 1 /* CSSRadialShape.ELLIPSE */) {
                rx = Math.min(Math.abs(x), Math.abs(x - width));
                ry = Math.min(Math.abs(y), Math.abs(y - height));
            }
            break;
        case 2 /* CSSRadialExtent.CLOSEST_CORNER */:
            // The ending shape is sized so that that it passes through the corner of the gradient box closest to the gradient’s center.
            // If the shape is an ellipse, the ending shape is given the same aspect-ratio it would have if closest-side were specified.
            if (gradient.shape === 0 /* CSSRadialShape.CIRCLE */) {
                rx = ry = Math.min(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
            }
            else if (gradient.shape === 1 /* CSSRadialShape.ELLIPSE */) {
                // Compute the ratio ry/rx (which is to be the same as for "closest-side")
                var c = Math.min(Math.abs(y), Math.abs(y - height)) / Math.min(Math.abs(x), Math.abs(x - width));
                var _a = findCorner(width, height, x, y, true), cx = _a[0], cy = _a[1];
                rx = distance(cx - x, (cy - y) / c);
                ry = c * rx;
            }
            break;
        case 1 /* CSSRadialExtent.FARTHEST_SIDE */:
            // Same as closest-side, except the ending shape is sized based on the farthest side(s)
            if (gradient.shape === 0 /* CSSRadialShape.CIRCLE */) {
                rx = ry = Math.max(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
            }
            else if (gradient.shape === 1 /* CSSRadialShape.ELLIPSE */) {
                rx = Math.max(Math.abs(x), Math.abs(x - width));
                ry = Math.max(Math.abs(y), Math.abs(y - height));
            }
            break;
        case 3 /* CSSRadialExtent.FARTHEST_CORNER */:
            // Same as closest-corner, except the ending shape is sized based on the farthest corner.
            // If the shape is an ellipse, the ending shape is given the same aspect ratio it would have if farthest-side were specified.
            if (gradient.shape === 0 /* CSSRadialShape.CIRCLE */) {
                rx = ry = Math.max(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
            }
            else if (gradient.shape === 1 /* CSSRadialShape.ELLIPSE */) {
                // Compute the ratio ry/rx (which is to be the same as for "farthest-side")
                var c = Math.max(Math.abs(y), Math.abs(y - height)) / Math.max(Math.abs(x), Math.abs(x - width));
                var _b = findCorner(width, height, x, y, false), cx = _b[0], cy = _b[1];
                rx = distance(cx - x, (cy - y) / c);
                ry = c * rx;
            }
            break;
    }
    if (Array.isArray(gradient.size)) {
        rx = getAbsoluteValue(gradient.size[0], width);
        ry = gradient.size.length === 2 ? getAbsoluteValue(gradient.size[1], height) : rx;
    }
    return [rx, ry];
};

var linearGradient = function (context, tokens) {
    var angle$1 = deg(180);
    var stops = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
        if (i === 0) {
            var firstToken = arg[0];
            if (firstToken.type === 20 /* TokenType.IDENT_TOKEN */ && firstToken.value === 'to') {
                angle$1 = parseNamedSide(arg);
                return;
            }
            else if (isAngle(firstToken)) {
                angle$1 = angle.parse(context, firstToken);
                return;
            }
        }
        var colorStop = parseColorStop(context, arg);
        stops.push(colorStop);
    });
    return { angle: angle$1, stops: stops, type: 1 /* CSSImageType.LINEAR_GRADIENT */ };
};

var prefixLinearGradient = function (context, tokens) {
    var angle$1 = deg(180);
    var stops = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
        if (i === 0) {
            var firstToken = arg[0];
            if (firstToken.type === 20 /* TokenType.IDENT_TOKEN */ &&
                ['top', 'left', 'right', 'bottom'].indexOf(firstToken.value) !== -1) {
                angle$1 = parseNamedSide(arg);
                return;
            }
            else if (isAngle(firstToken)) {
                angle$1 = (angle.parse(context, firstToken) + deg(270)) % deg(360);
                return;
            }
        }
        var colorStop = parseColorStop(context, arg);
        stops.push(colorStop);
    });
    return {
        angle: angle$1,
        stops: stops,
        type: 1 /* CSSImageType.LINEAR_GRADIENT */,
    };
};

var webkitGradient = function (context, tokens) {
    var angle = deg(180);
    var stops = [];
    var type = 1 /* CSSImageType.LINEAR_GRADIENT */;
    var shape = 0 /* CSSRadialShape.CIRCLE */;
    var size = 3 /* CSSRadialExtent.FARTHEST_CORNER */;
    var position = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
        var firstToken = arg[0];
        if (i === 0) {
            if (isIdentToken(firstToken) && firstToken.value === 'linear') {
                type = 1 /* CSSImageType.LINEAR_GRADIENT */;
                return;
            }
            else if (isIdentToken(firstToken) && firstToken.value === 'radial') {
                type = 2 /* CSSImageType.RADIAL_GRADIENT */;
                return;
            }
        }
        if (firstToken.type === 18 /* TokenType.FUNCTION */) {
            if (firstToken.name === 'from') {
                var color = color$1.parse(context, firstToken.values[0]);
                stops.push({ stop: ZERO_LENGTH, color: color });
            }
            else if (firstToken.name === 'to') {
                var color = color$1.parse(context, firstToken.values[0]);
                stops.push({ stop: HUNDRED_PERCENT, color: color });
            }
            else if (firstToken.name === 'color-stop') {
                var values = firstToken.values.filter(nonFunctionArgSeparator);
                if (values.length === 2) {
                    var color = color$1.parse(context, values[1]);
                    var stop_1 = values[0];
                    if (isNumberToken(stop_1)) {
                        stops.push({
                            stop: { type: 16 /* TokenType.PERCENTAGE_TOKEN */, number: stop_1.number * 100, flags: stop_1.flags },
                            color: color,
                        });
                    }
                }
            }
        }
    });
    return type === 1 /* CSSImageType.LINEAR_GRADIENT */
        ? {
            angle: (angle + deg(180)) % deg(360),
            stops: stops,
            type: type,
        }
        : { size: size, shape: shape, stops: stops, position: position, type: type };
};

var CLOSEST_SIDE = 'closest-side';
var FARTHEST_SIDE = 'farthest-side';
var CLOSEST_CORNER = 'closest-corner';
var FARTHEST_CORNER = 'farthest-corner';
var CIRCLE = 'circle';
var ELLIPSE = 'ellipse';
var COVER = 'cover';
var CONTAIN = 'contain';
var radialGradient = function (context, tokens) {
    var shape = 0 /* CSSRadialShape.CIRCLE */;
    var size = 3 /* CSSRadialExtent.FARTHEST_CORNER */;
    var stops = [];
    var position = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
        var isColorStop = true;
        if (i === 0) {
            var isAtPosition_1 = false;
            isColorStop = arg.reduce(function (acc, token) {
                if (isAtPosition_1) {
                    if (isIdentToken(token)) {
                        switch (token.value) {
                            case 'center':
                                position.push(FIFTY_PERCENT);
                                return acc;
                            case 'top':
                            case 'left':
                                position.push(ZERO_LENGTH);
                                return acc;
                            case 'right':
                            case 'bottom':
                                position.push(HUNDRED_PERCENT);
                                return acc;
                        }
                    }
                    else if (isLengthPercentage(token) || isLength(token)) {
                        position.push(token);
                    }
                }
                else if (isIdentToken(token)) {
                    switch (token.value) {
                        case CIRCLE:
                            shape = 0 /* CSSRadialShape.CIRCLE */;
                            return false;
                        case ELLIPSE:
                            shape = 1 /* CSSRadialShape.ELLIPSE */;
                            return false;
                        case 'at':
                            isAtPosition_1 = true;
                            return false;
                        case CLOSEST_SIDE:
                            size = 0 /* CSSRadialExtent.CLOSEST_SIDE */;
                            return false;
                        case COVER:
                        case FARTHEST_SIDE:
                            size = 1 /* CSSRadialExtent.FARTHEST_SIDE */;
                            return false;
                        case CONTAIN:
                        case CLOSEST_CORNER:
                            size = 2 /* CSSRadialExtent.CLOSEST_CORNER */;
                            return false;
                        case FARTHEST_CORNER:
                            size = 3 /* CSSRadialExtent.FARTHEST_CORNER */;
                            return false;
                    }
                }
                else if (isLength(token) || isLengthPercentage(token)) {
                    if (!Array.isArray(size)) {
                        size = [];
                    }
                    size.push(token);
                    return false;
                }
                return acc;
            }, isColorStop);
        }
        if (isColorStop) {
            var colorStop = parseColorStop(context, arg);
            stops.push(colorStop);
        }
    });
    return { size: size, shape: shape, stops: stops, position: position, type: 2 /* CSSImageType.RADIAL_GRADIENT */ };
};

var prefixRadialGradient = function (context, tokens) {
    var shape = 0 /* CSSRadialShape.CIRCLE */;
    var size = 3 /* CSSRadialExtent.FARTHEST_CORNER */;
    var stops = [];
    var position = [];
    parseFunctionArgs(tokens).forEach(function (arg, i) {
        var isColorStop = true;
        if (i === 0) {
            isColorStop = arg.reduce(function (acc, token) {
                if (isIdentToken(token)) {
                    switch (token.value) {
                        case 'center':
                            position.push(FIFTY_PERCENT);
                            return false;
                        case 'top':
                        case 'left':
                            position.push(ZERO_LENGTH);
                            return false;
                        case 'right':
                        case 'bottom':
                            position.push(HUNDRED_PERCENT);
                            return false;
                    }
                }
                else if (isLengthPercentage(token) || isLength(token)) {
                    position.push(token);
                    return false;
                }
                return acc;
            }, isColorStop);
        }
        else if (i === 1) {
            isColorStop = arg.reduce(function (acc, token) {
                if (isIdentToken(token)) {
                    switch (token.value) {
                        case CIRCLE:
                            shape = 0 /* CSSRadialShape.CIRCLE */;
                            return false;
                        case ELLIPSE:
                            shape = 1 /* CSSRadialShape.ELLIPSE */;
                            return false;
                        case CONTAIN:
                        case CLOSEST_SIDE:
                            size = 0 /* CSSRadialExtent.CLOSEST_SIDE */;
                            return false;
                        case FARTHEST_SIDE:
                            size = 1 /* CSSRadialExtent.FARTHEST_SIDE */;
                            return false;
                        case CLOSEST_CORNER:
                            size = 2 /* CSSRadialExtent.CLOSEST_CORNER */;
                            return false;
                        case COVER:
                        case FARTHEST_CORNER:
                            size = 3 /* CSSRadialExtent.FARTHEST_CORNER */;
                            return false;
                    }
                }
                else if (isLength(token) || isLengthPercentage(token)) {
                    if (!Array.isArray(size)) {
                        size = [];
                    }
                    size.push(token);
                    return false;
                }
                return acc;
            }, isColorStop);
        }
        if (isColorStop) {
            var colorStop = parseColorStop(context, arg);
            stops.push(colorStop);
        }
    });
    return { size: size, shape: shape, stops: stops, position: position, type: 2 /* CSSImageType.RADIAL_GRADIENT */ };
};

var isLinearGradient = function (background) {
    return background.type === 1 /* CSSImageType.LINEAR_GRADIENT */;
};
var isRadialGradient = function (background) {
    return background.type === 2 /* CSSImageType.RADIAL_GRADIENT */;
};
var image = {
    name: 'image',
    parse: function (context, value) {
        if (value.type === 22 /* TokenType.URL_TOKEN */) {
            var image_1 = { url: value.value, type: 0 /* CSSImageType.URL */ };
            context.cache.addImage(value.value);
            return image_1;
        }
        if (value.type === 18 /* TokenType.FUNCTION */) {
            var imageFunction = SUPPORTED_IMAGE_FUNCTIONS[value.name];
            if (typeof imageFunction === 'undefined') {
                throw new Error("Attempting to parse an unsupported image function \"".concat(value.name, "\""));
            }
            return imageFunction(context, value.values);
        }
        throw new Error("Unsupported image type ".concat(value.type));
    },
};
function isSupportedImage(value) {
    return (!(value.type === 20 /* TokenType.IDENT_TOKEN */ && value.value === 'none') &&
        (value.type !== 18 /* TokenType.FUNCTION */ || !!SUPPORTED_IMAGE_FUNCTIONS[value.name]));
}
var SUPPORTED_IMAGE_FUNCTIONS = {
    'linear-gradient': linearGradient,
    '-moz-linear-gradient': prefixLinearGradient,
    '-ms-linear-gradient': prefixLinearGradient,
    '-o-linear-gradient': prefixLinearGradient,
    '-webkit-linear-gradient': prefixLinearGradient,
    'radial-gradient': radialGradient,
    '-moz-radial-gradient': prefixRadialGradient,
    '-ms-radial-gradient': prefixRadialGradient,
    '-o-radial-gradient': prefixRadialGradient,
    '-webkit-radial-gradient': prefixRadialGradient,
    '-webkit-gradient': webkitGradient,
};

var backgroundImage = {
    name: 'background-image',
    initialValue: 'none',
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    prefix: false,
    parse: function (context, tokens) {
        if (tokens.length === 0) {
            return [];
        }
        var first = tokens[0];
        if (first.type === 20 /* TokenType.IDENT_TOKEN */ && first.value === 'none') {
            return [];
        }
        return tokens
            .filter(function (value) { return nonFunctionArgSeparator(value) && isSupportedImage(value); })
            .map(function (value) { return image.parse(context, value); });
    },
};

var backgroundOrigin = {
    name: 'background-origin',
    initialValue: 'border-box',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        return tokens.map(function (token) {
            if (isIdentToken(token)) {
                switch (token.value) {
                    case 'padding-box':
                        return 1 /* BACKGROUND_ORIGIN.PADDING_BOX */;
                    case 'content-box':
                        return 2 /* BACKGROUND_ORIGIN.CONTENT_BOX */;
                }
            }
            return 0 /* BACKGROUND_ORIGIN.BORDER_BOX */;
        });
    },
};

var backgroundPosition = {
    name: 'background-position',
    initialValue: '0% 0%',
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    prefix: false,
    parse: function (_context, tokens) {
        return parseFunctionArgs(tokens)
            .map(function (values) { return values.filter(isLengthPercentage); })
            .map(parseLengthPercentageTuple);
    },
};

var backgroundRepeat = {
    name: 'background-repeat',
    initialValue: 'repeat',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        return parseFunctionArgs(tokens)
            .map(function (values) {
            return values
                .filter(isIdentToken)
                .map(function (token) { return token.value; })
                .join(' ');
        })
            .map(parseBackgroundRepeat);
    },
};
var parseBackgroundRepeat = function (value) {
    switch (value) {
        case 'no-repeat':
            return 1 /* BACKGROUND_REPEAT.NO_REPEAT */;
        case 'repeat-x':
        case 'repeat no-repeat':
            return 2 /* BACKGROUND_REPEAT.REPEAT_X */;
        case 'repeat-y':
        case 'no-repeat repeat':
            return 3 /* BACKGROUND_REPEAT.REPEAT_Y */;
        case 'repeat':
        default:
            return 0 /* BACKGROUND_REPEAT.REPEAT */;
    }
};

var BACKGROUND_SIZE;
(function (BACKGROUND_SIZE) {
    BACKGROUND_SIZE["AUTO"] = "auto";
    BACKGROUND_SIZE["CONTAIN"] = "contain";
    BACKGROUND_SIZE["COVER"] = "cover";
})(BACKGROUND_SIZE || (BACKGROUND_SIZE = {}));
var backgroundSize = {
    name: 'background-size',
    initialValue: '0',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        return parseFunctionArgs(tokens).map(function (values) { return values.filter(isBackgroundSizeInfoToken); });
    },
};
var isBackgroundSizeInfoToken = function (value) {
    return isIdentToken(value) || isLengthPercentage(value);
};

var borderColorForSide = function (side) { return ({
    name: "border-".concat(side, "-color"),
    initialValue: 'transparent',
    prefix: false,
    type: 3 /* PropertyDescriptorParsingType.TYPE_VALUE */,
    format: 'color',
}); };
var borderTopColor = borderColorForSide('top');
var borderRightColor = borderColorForSide('right');
var borderBottomColor = borderColorForSide('bottom');
var borderLeftColor = borderColorForSide('left');

var borderRadiusForSide = function (side) { return ({
    name: "border-radius-".concat(side),
    initialValue: '0 0',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        return parseLengthPercentageTuple(tokens.filter(isLengthPercentage));
    },
}); };
var borderTopLeftRadius = borderRadiusForSide('top-left');
var borderTopRightRadius = borderRadiusForSide('top-right');
var borderBottomRightRadius = borderRadiusForSide('bottom-right');
var borderBottomLeftRadius = borderRadiusForSide('bottom-left');

var borderStyleForSide = function (side) { return ({
    name: "border-".concat(side, "-style"),
    initialValue: 'solid',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, style) {
        switch (style) {
            case 'none':
                return 0 /* BORDER_STYLE.NONE */;
            case 'dashed':
                return 2 /* BORDER_STYLE.DASHED */;
            case 'dotted':
                return 3 /* BORDER_STYLE.DOTTED */;
            case 'double':
                return 4 /* BORDER_STYLE.DOUBLE */;
        }
        return 1 /* BORDER_STYLE.SOLID */;
    },
}); };
var borderTopStyle = borderStyleForSide('top');
var borderRightStyle = borderStyleForSide('right');
var borderBottomStyle = borderStyleForSide('bottom');
var borderLeftStyle = borderStyleForSide('left');

var borderWidthForSide = function (side) { return ({
    name: "border-".concat(side, "-width"),
    initialValue: '0',
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    prefix: false,
    parse: function (_context, token) {
        if (isDimensionToken(token)) {
            return token.number;
        }
        return 0;
    },
}); };
var borderTopWidth = borderWidthForSide('top');
var borderRightWidth = borderWidthForSide('right');
var borderBottomWidth = borderWidthForSide('bottom');
var borderLeftWidth = borderWidthForSide('left');

var boxShadow = {
    name: 'box-shadow',
    initialValue: 'none',
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    prefix: false,
    parse: function (context, tokens) {
        if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
            return [];
        }
        return parseFunctionArgs(tokens).map(function (values) {
            var shadow = {
                color: 0x000000ff,
                offsetX: ZERO_LENGTH,
                offsetY: ZERO_LENGTH,
                blur: ZERO_LENGTH,
                spread: ZERO_LENGTH,
                inset: false,
            };
            var c = 0;
            for (var i = 0; i < values.length; i++) {
                var token = values[i];
                if (isIdentWithValue(token, 'inset')) {
                    shadow.inset = true;
                }
                else if (isLength(token)) {
                    if (c === 0) {
                        shadow.offsetX = token;
                    }
                    else if (c === 1) {
                        shadow.offsetY = token;
                    }
                    else if (c === 2) {
                        shadow.blur = token;
                    }
                    else {
                        shadow.spread = token;
                    }
                    c++;
                }
                else {
                    shadow.color = color$1.parse(context, token);
                }
            }
            return shadow;
        });
    },
};

var color = {
    name: "color",
    initialValue: 'transparent',
    prefix: false,
    type: 3 /* PropertyDescriptorParsingType.TYPE_VALUE */,
    format: 'color',
};

var content = {
    name: 'content',
    initialValue: 'none',
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    prefix: false,
    parse: function (_context, tokens) {
        if (tokens.length === 0) {
            return [];
        }
        var first = tokens[0];
        if (first.type === 20 /* TokenType.IDENT_TOKEN */ && first.value === 'none') {
            return [];
        }
        return tokens;
    },
};

var counterIncrement = {
    name: 'counter-increment',
    initialValue: 'none',
    prefix: true,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        if (tokens.length === 0) {
            return null;
        }
        var first = tokens[0];
        if (first.type === 20 /* TokenType.IDENT_TOKEN */ && first.value === 'none') {
            return null;
        }
        var increments = [];
        var filtered = tokens.filter(nonWhiteSpace);
        for (var i = 0; i < filtered.length; i++) {
            var counter = filtered[i];
            var next = filtered[i + 1];
            if (counter.type === 20 /* TokenType.IDENT_TOKEN */) {
                var increment = next && isNumberToken(next) ? next.number : 1;
                increments.push({ counter: counter.value, increment: increment });
            }
        }
        return increments;
    },
};

var counterReset = {
    name: 'counter-reset',
    initialValue: 'none',
    prefix: true,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        if (tokens.length === 0) {
            return [];
        }
        var resets = [];
        var filtered = tokens.filter(nonWhiteSpace);
        for (var i = 0; i < filtered.length; i++) {
            var counter = filtered[i];
            var next = filtered[i + 1];
            if (isIdentToken(counter) && counter.value !== 'none') {
                var reset = next && isNumberToken(next) ? next.number : 0;
                resets.push({ counter: counter.value, reset: reset });
            }
        }
        return resets;
    },
};

var direction = {
    name: 'direction',
    initialValue: 'ltr',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, direction) {
        switch (direction) {
            case 'rtl':
                return 1 /* DIRECTION.RTL */;
            case 'ltr':
            default:
                return 0 /* DIRECTION.LTR */;
        }
    },
};

var display = {
    name: 'display',
    initialValue: 'inline-block',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        return tokens.filter(isIdentToken).reduce(function (bit, token) {
            return bit | parseDisplayValue(token.value);
        }, 0 /* DISPLAY.NONE */);
    },
};
var parseDisplayValue = function (display) {
    switch (display) {
        case 'block':
        case '-webkit-box':
            return 2 /* DISPLAY.BLOCK */;
        case 'inline':
            return 4 /* DISPLAY.INLINE */;
        case 'run-in':
            return 8 /* DISPLAY.RUN_IN */;
        case 'flow':
            return 16 /* DISPLAY.FLOW */;
        case 'flow-root':
            return 32 /* DISPLAY.FLOW_ROOT */;
        case 'table':
            return 64 /* DISPLAY.TABLE */;
        case 'flex':
        case '-webkit-flex':
            return 128 /* DISPLAY.FLEX */;
        case 'grid':
        case '-ms-grid':
            return 256 /* DISPLAY.GRID */;
        case 'ruby':
            return 512 /* DISPLAY.RUBY */;
        case 'subgrid':
            return 1024 /* DISPLAY.SUBGRID */;
        case 'list-item':
            return 2048 /* DISPLAY.LIST_ITEM */;
        case 'table-row-group':
            return 4096 /* DISPLAY.TABLE_ROW_GROUP */;
        case 'table-header-group':
            return 8192 /* DISPLAY.TABLE_HEADER_GROUP */;
        case 'table-footer-group':
            return 16384 /* DISPLAY.TABLE_FOOTER_GROUP */;
        case 'table-row':
            return 32768 /* DISPLAY.TABLE_ROW */;
        case 'table-cell':
            return 65536 /* DISPLAY.TABLE_CELL */;
        case 'table-column-group':
            return 131072 /* DISPLAY.TABLE_COLUMN_GROUP */;
        case 'table-column':
            return 262144 /* DISPLAY.TABLE_COLUMN */;
        case 'table-caption':
            return 524288 /* DISPLAY.TABLE_CAPTION */;
        case 'ruby-base':
            return 1048576 /* DISPLAY.RUBY_BASE */;
        case 'ruby-text':
            return 2097152 /* DISPLAY.RUBY_TEXT */;
        case 'ruby-base-container':
            return 4194304 /* DISPLAY.RUBY_BASE_CONTAINER */;
        case 'ruby-text-container':
            return 8388608 /* DISPLAY.RUBY_TEXT_CONTAINER */;
        case 'contents':
            return 16777216 /* DISPLAY.CONTENTS */;
        case 'inline-block':
            return 33554432 /* DISPLAY.INLINE_BLOCK */;
        case 'inline-list-item':
            return 67108864 /* DISPLAY.INLINE_LIST_ITEM */;
        case 'inline-table':
            return 134217728 /* DISPLAY.INLINE_TABLE */;
        case 'inline-flex':
            return 268435456 /* DISPLAY.INLINE_FLEX */;
        case 'inline-grid':
            return 536870912 /* DISPLAY.INLINE_GRID */;
    }
    return 0 /* DISPLAY.NONE */;
};

var time = {
    name: 'time',
    parse: function (_context, value) {
        if (value.type === 15 /* TokenType.DIMENSION_TOKEN */) {
            switch (value.unit.toLowerCase()) {
                case 's':
                    return 1000 * value.number;
                case 'ms':
                    return value.number;
            }
        }
        throw new Error("Unsupported time type");
    },
};

var duration = {
    name: 'duration',
    initialValue: '0s',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (context, tokens) {
        return tokens.filter(isDimensionToken).map(function (token) { return time.parse(context, token); });
    },
};

var filter = {
    name: 'filter',
    initialValue: 'none',
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    prefix: false,
    parse: function (context, tokens) {
        if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
            return [];
        }
        var filters = [];
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token.type === 18 /* TokenType.FUNCTION */) {
                var parsed = parseFilterFunction(context, token.name, token.values);
                if (parsed) {
                    filters.push(parsed);
                }
            }
        }
        return filters;
    },
};
var parseFilterFunction = function (context, name, values) {
    switch (name) {
        case 'drop-shadow':
            return parseDropShadow(context, values);
        case 'blur':
            return parseBlur(values);
        case 'brightness':
            return parseAmountFilter(2 /* FilterType.BRIGHTNESS */, values);
        case 'contrast':
            return parseAmountFilter(3 /* FilterType.CONTRAST */, values);
        case 'grayscale':
            return parseAmountFilter(4 /* FilterType.GRAYSCALE */, values);
        case 'invert':
            return parseAmountFilter(6 /* FilterType.INVERT */, values);
        case 'opacity':
            return parseAmountFilter(7 /* FilterType.OPACITY */, values);
        case 'saturate':
            return parseAmountFilter(8 /* FilterType.SATURATE */, values);
        case 'sepia':
            return parseAmountFilter(9 /* FilterType.SEPIA */, values);
        case 'hue-rotate':
            return parseHueRotate(values);
        default:
            return null;
    }
};
var parseDropShadow = function (context, values) {
    var shadow = {
        type: 0 /* FilterType.DROP_SHADOW */,
        color: COLORS.TRANSPARENT,
        offsetX: ZERO_LENGTH,
        offsetY: ZERO_LENGTH,
        blur: ZERO_LENGTH,
    };
    var lengthCount = 0;
    for (var i = 0; i < values.length; i++) {
        var token = values[i];
        if (token.type === 31 /* TokenType.WHITESPACE_TOKEN */) {
            continue;
        }
        if (isLength(token)) {
            if (lengthCount === 0) {
                shadow.offsetX = token;
            }
            else if (lengthCount === 1) {
                shadow.offsetY = token;
            }
            else if (lengthCount === 2) {
                shadow.blur = token;
            }
            lengthCount++;
        }
        else {
            shadow.color = color$1.parse(context, token);
        }
    }
    // At minimum, offsetX and offsetY are required
    if (lengthCount < 2) {
        return null;
    }
    return shadow;
};
var parseBlur = function (values) {
    var result = {
        type: 1 /* FilterType.BLUR */,
        radius: ZERO_LENGTH,
    };
    for (var i = 0; i < values.length; i++) {
        var token = values[i];
        if (isLength(token)) {
            result.radius = token;
            break;
        }
    }
    return result;
};
var parseAmountFilter = function (type, values) {
    var result = {
        type: type,
        amount: 1, // default is 1 (100%) for most filters
    };
    for (var i = 0; i < values.length; i++) {
        var token = values[i];
        if (token.type === 16 /* TokenType.PERCENTAGE_TOKEN */) {
            result.amount = token.number / 100;
            break;
        }
        if (token.type === 17 /* TokenType.NUMBER_TOKEN */) {
            result.amount = token.number;
            break;
        }
    }
    return result;
};
var parseHueRotate = function (values) {
    var result = {
        type: 5 /* FilterType.HUE_ROTATE */,
        angle: 0,
    };
    for (var i = 0; i < values.length; i++) {
        var token = values[i];
        if (token.type === 15 /* TokenType.DIMENSION_TOKEN */) {
            switch (token.unit) {
                case 'deg':
                    result.angle = token.number;
                    break;
                case 'rad':
                    result.angle = (token.number * 180) / Math.PI;
                    break;
                case 'grad':
                    result.angle = (token.number * 180) / 200;
                    break;
                case 'turn':
                    result.angle = token.number * 360;
                    break;
            }
            break;
        }
        if (token.type === 17 /* TokenType.NUMBER_TOKEN */ && token.number === 0) {
            result.angle = 0;
            break;
        }
    }
    return result;
};

var float = {
    name: 'float',
    initialValue: 'none',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, float) {
        switch (float) {
            case 'left':
                return 1 /* FLOAT.LEFT */;
            case 'right':
                return 2 /* FLOAT.RIGHT */;
            case 'inline-start':
                return 3 /* FLOAT.INLINE_START */;
            case 'inline-end':
                return 4 /* FLOAT.INLINE_END */;
        }
        return 0 /* FLOAT.NONE */;
    },
};

var fontFamily = {
    name: "font-family",
    initialValue: '',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        var accumulator = [];
        var results = [];
        tokens.forEach(function (token) {
            switch (token.type) {
                case 20 /* TokenType.IDENT_TOKEN */:
                case 0 /* TokenType.STRING_TOKEN */:
                    accumulator.push(token.value);
                    break;
                case 17 /* TokenType.NUMBER_TOKEN */:
                    accumulator.push(token.number.toString());
                    break;
                case 4 /* TokenType.COMMA_TOKEN */:
                    results.push(accumulator.join(' '));
                    accumulator.length = 0;
                    break;
            }
        });
        if (accumulator.length) {
            results.push(accumulator.join(' '));
        }
        return results.map(function (result) { return (result.indexOf(' ') === -1 ? result : "'".concat(result, "'")); });
    },
};

var fontSize = {
    name: "font-size",
    initialValue: '0',
    prefix: false,
    type: 3 /* PropertyDescriptorParsingType.TYPE_VALUE */,
    format: 'length',
};

var fontStyle = {
    name: 'font-style',
    initialValue: 'normal',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, overflow) {
        switch (overflow) {
            case 'oblique':
                return "oblique" /* FONT_STYLE.OBLIQUE */;
            case 'italic':
                return "italic" /* FONT_STYLE.ITALIC */;
            case 'normal':
            default:
                return "normal" /* FONT_STYLE.NORMAL */;
        }
    },
};

var fontVariant = {
    name: 'font-variant',
    initialValue: 'none',
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    prefix: false,
    parse: function (_context, tokens) {
        return tokens.filter(isIdentToken).map(function (token) { return token.value; });
    },
};

var fontWeight = {
    name: 'font-weight',
    initialValue: 'normal',
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    prefix: false,
    parse: function (_context, token) {
        if (isNumberToken(token)) {
            return token.number;
        }
        if (isIdentToken(token)) {
            switch (token.value) {
                case 'bold':
                    return 700;
                case 'normal':
                default:
                    return 400;
            }
        }
        return 400;
    },
};

var letterSpacing = {
    name: 'letter-spacing',
    initialValue: '0',
    prefix: false,
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    parse: function (_context, token) {
        if (token.type === 20 /* TokenType.IDENT_TOKEN */ && token.value === 'normal') {
            return 0;
        }
        if (token.type === 17 /* TokenType.NUMBER_TOKEN */) {
            return token.number;
        }
        if (token.type === 15 /* TokenType.DIMENSION_TOKEN */) {
            return token.number;
        }
        return 0;
    },
};

var LINE_BREAK;
(function (LINE_BREAK) {
    LINE_BREAK["NORMAL"] = "normal";
    LINE_BREAK["STRICT"] = "strict";
})(LINE_BREAK || (LINE_BREAK = {}));
var lineBreak = {
    name: 'line-break',
    initialValue: 'normal',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, lineBreak) {
        switch (lineBreak) {
            case 'strict':
                return LINE_BREAK.STRICT;
            case 'normal':
            default:
                return LINE_BREAK.NORMAL;
        }
    },
};

var lineHeight = {
    name: 'line-height',
    initialValue: 'normal',
    prefix: false,
    type: 4 /* PropertyDescriptorParsingType.TOKEN_VALUE */,
};
var computeLineHeight = function (token, fontSize) {
    if (isIdentToken(token) && token.value === 'normal') {
        return 1.2 * fontSize;
    }
    else if (token.type === 17 /* TokenType.NUMBER_TOKEN */) {
        return fontSize * token.number;
    }
    else if (isLengthPercentage(token)) {
        return getAbsoluteValue(token, fontSize);
    }
    return fontSize;
};

var listStyleImage = {
    name: 'list-style-image',
    initialValue: 'none',
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    prefix: false,
    parse: function (context, token) {
        if (token.type === 20 /* TokenType.IDENT_TOKEN */ && token.value === 'none') {
            return null;
        }
        return image.parse(context, token);
    },
};

var listStylePosition = {
    name: 'list-style-position',
    initialValue: 'outside',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, position) {
        switch (position) {
            case 'inside':
                return 0 /* LIST_STYLE_POSITION.INSIDE */;
            case 'outside':
            default:
                return 1 /* LIST_STYLE_POSITION.OUTSIDE */;
        }
    },
};

var listStyleType = {
    name: 'list-style-type',
    initialValue: 'none',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, type) {
        switch (type) {
            case 'disc':
                return 0 /* LIST_STYLE_TYPE.DISC */;
            case 'circle':
                return 1 /* LIST_STYLE_TYPE.CIRCLE */;
            case 'square':
                return 2 /* LIST_STYLE_TYPE.SQUARE */;
            case 'decimal':
                return 3 /* LIST_STYLE_TYPE.DECIMAL */;
            case 'cjk-decimal':
                return 4 /* LIST_STYLE_TYPE.CJK_DECIMAL */;
            case 'decimal-leading-zero':
                return 5 /* LIST_STYLE_TYPE.DECIMAL_LEADING_ZERO */;
            case 'lower-roman':
                return 6 /* LIST_STYLE_TYPE.LOWER_ROMAN */;
            case 'upper-roman':
                return 7 /* LIST_STYLE_TYPE.UPPER_ROMAN */;
            case 'lower-greek':
                return 8 /* LIST_STYLE_TYPE.LOWER_GREEK */;
            case 'lower-alpha':
                return 9 /* LIST_STYLE_TYPE.LOWER_ALPHA */;
            case 'upper-alpha':
                return 10 /* LIST_STYLE_TYPE.UPPER_ALPHA */;
            case 'arabic-indic':
                return 11 /* LIST_STYLE_TYPE.ARABIC_INDIC */;
            case 'armenian':
                return 12 /* LIST_STYLE_TYPE.ARMENIAN */;
            case 'bengali':
                return 13 /* LIST_STYLE_TYPE.BENGALI */;
            case 'cambodian':
                return 14 /* LIST_STYLE_TYPE.CAMBODIAN */;
            case 'cjk-earthly-branch':
                return 15 /* LIST_STYLE_TYPE.CJK_EARTHLY_BRANCH */;
            case 'cjk-heavenly-stem':
                return 16 /* LIST_STYLE_TYPE.CJK_HEAVENLY_STEM */;
            case 'cjk-ideographic':
                return 17 /* LIST_STYLE_TYPE.CJK_IDEOGRAPHIC */;
            case 'devanagari':
                return 18 /* LIST_STYLE_TYPE.DEVANAGARI */;
            case 'ethiopic-numeric':
                return 19 /* LIST_STYLE_TYPE.ETHIOPIC_NUMERIC */;
            case 'georgian':
                return 20 /* LIST_STYLE_TYPE.GEORGIAN */;
            case 'gujarati':
                return 21 /* LIST_STYLE_TYPE.GUJARATI */;
            case 'gurmukhi':
                return 22 /* LIST_STYLE_TYPE.GURMUKHI */;
            case 'hebrew':
                return 23 /* LIST_STYLE_TYPE.HEBREW */;
            case 'hiragana':
                return 24 /* LIST_STYLE_TYPE.HIRAGANA */;
            case 'hiragana-iroha':
                return 25 /* LIST_STYLE_TYPE.HIRAGANA_IROHA */;
            case 'japanese-formal':
                return 26 /* LIST_STYLE_TYPE.JAPANESE_FORMAL */;
            case 'japanese-informal':
                return 27 /* LIST_STYLE_TYPE.JAPANESE_INFORMAL */;
            case 'kannada':
                return 28 /* LIST_STYLE_TYPE.KANNADA */;
            case 'katakana':
                return 29 /* LIST_STYLE_TYPE.KATAKANA */;
            case 'katakana-iroha':
                return 30 /* LIST_STYLE_TYPE.KATAKANA_IROHA */;
            case 'khmer':
                return 31 /* LIST_STYLE_TYPE.KHMER */;
            case 'korean-hangul-formal':
                return 32 /* LIST_STYLE_TYPE.KOREAN_HANGUL_FORMAL */;
            case 'korean-hanja-formal':
                return 33 /* LIST_STYLE_TYPE.KOREAN_HANJA_FORMAL */;
            case 'korean-hanja-informal':
                return 34 /* LIST_STYLE_TYPE.KOREAN_HANJA_INFORMAL */;
            case 'lao':
                return 35 /* LIST_STYLE_TYPE.LAO */;
            case 'lower-armenian':
                return 36 /* LIST_STYLE_TYPE.LOWER_ARMENIAN */;
            case 'malayalam':
                return 37 /* LIST_STYLE_TYPE.MALAYALAM */;
            case 'mongolian':
                return 38 /* LIST_STYLE_TYPE.MONGOLIAN */;
            case 'myanmar':
                return 39 /* LIST_STYLE_TYPE.MYANMAR */;
            case 'oriya':
                return 40 /* LIST_STYLE_TYPE.ORIYA */;
            case 'persian':
                return 41 /* LIST_STYLE_TYPE.PERSIAN */;
            case 'simp-chinese-formal':
                return 42 /* LIST_STYLE_TYPE.SIMP_CHINESE_FORMAL */;
            case 'simp-chinese-informal':
                return 43 /* LIST_STYLE_TYPE.SIMP_CHINESE_INFORMAL */;
            case 'tamil':
                return 44 /* LIST_STYLE_TYPE.TAMIL */;
            case 'telugu':
                return 45 /* LIST_STYLE_TYPE.TELUGU */;
            case 'thai':
                return 46 /* LIST_STYLE_TYPE.THAI */;
            case 'tibetan':
                return 47 /* LIST_STYLE_TYPE.TIBETAN */;
            case 'trad-chinese-formal':
                return 48 /* LIST_STYLE_TYPE.TRAD_CHINESE_FORMAL */;
            case 'trad-chinese-informal':
                return 49 /* LIST_STYLE_TYPE.TRAD_CHINESE_INFORMAL */;
            case 'upper-armenian':
                return 50 /* LIST_STYLE_TYPE.UPPER_ARMENIAN */;
            case 'disclosure-open':
                return 51 /* LIST_STYLE_TYPE.DISCLOSURE_OPEN */;
            case 'disclosure-closed':
                return 52 /* LIST_STYLE_TYPE.DISCLOSURE_CLOSED */;
            case 'none':
            default:
                return -1 /* LIST_STYLE_TYPE.NONE */;
        }
    },
};

var marginForSide = function (side) { return ({
    name: "margin-".concat(side),
    initialValue: '0',
    prefix: false,
    type: 4 /* PropertyDescriptorParsingType.TOKEN_VALUE */,
}); };
var marginTop = marginForSide('top');
var marginRight = marginForSide('right');
var marginBottom = marginForSide('bottom');
var marginLeft = marginForSide('left');

var _a;
var mixBlendMode = {
    name: 'mix-blend-mode',
    initialValue: 'normal',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, mode) {
        switch (mode) {
            case 'multiply':
                return 1 /* MIX_BLEND_MODE.MULTIPLY */;
            case 'screen':
                return 2 /* MIX_BLEND_MODE.SCREEN */;
            case 'overlay':
                return 3 /* MIX_BLEND_MODE.OVERLAY */;
            case 'darken':
                return 4 /* MIX_BLEND_MODE.DARKEN */;
            case 'lighten':
                return 5 /* MIX_BLEND_MODE.LIGHTEN */;
            case 'color-dodge':
                return 6 /* MIX_BLEND_MODE.COLOR_DODGE */;
            case 'color-burn':
                return 7 /* MIX_BLEND_MODE.COLOR_BURN */;
            case 'hard-light':
                return 8 /* MIX_BLEND_MODE.HARD_LIGHT */;
            case 'soft-light':
                return 9 /* MIX_BLEND_MODE.SOFT_LIGHT */;
            case 'difference':
                return 10 /* MIX_BLEND_MODE.DIFFERENCE */;
            case 'exclusion':
                return 11 /* MIX_BLEND_MODE.EXCLUSION */;
            case 'hue':
                return 12 /* MIX_BLEND_MODE.HUE */;
            case 'saturation':
                return 13 /* MIX_BLEND_MODE.SATURATION */;
            case 'color':
                return 14 /* MIX_BLEND_MODE.COLOR */;
            case 'luminosity':
                return 15 /* MIX_BLEND_MODE.LUMINOSITY */;
            case 'normal':
            default:
                return 0 /* MIX_BLEND_MODE.NORMAL */;
        }
    },
};
/** Map enum to the globalCompositeOperation string value */
var mixBlendModeToComposite = (_a = {},
    _a[0 /* MIX_BLEND_MODE.NORMAL */] = 'source-over',
    _a[1 /* MIX_BLEND_MODE.MULTIPLY */] = 'multiply',
    _a[2 /* MIX_BLEND_MODE.SCREEN */] = 'screen',
    _a[3 /* MIX_BLEND_MODE.OVERLAY */] = 'overlay',
    _a[4 /* MIX_BLEND_MODE.DARKEN */] = 'darken',
    _a[5 /* MIX_BLEND_MODE.LIGHTEN */] = 'lighten',
    _a[6 /* MIX_BLEND_MODE.COLOR_DODGE */] = 'color-dodge',
    _a[7 /* MIX_BLEND_MODE.COLOR_BURN */] = 'color-burn',
    _a[8 /* MIX_BLEND_MODE.HARD_LIGHT */] = 'hard-light',
    _a[9 /* MIX_BLEND_MODE.SOFT_LIGHT */] = 'soft-light',
    _a[10 /* MIX_BLEND_MODE.DIFFERENCE */] = 'difference',
    _a[11 /* MIX_BLEND_MODE.EXCLUSION */] = 'exclusion',
    _a[12 /* MIX_BLEND_MODE.HUE */] = 'hue',
    _a[13 /* MIX_BLEND_MODE.SATURATION */] = 'saturation',
    _a[14 /* MIX_BLEND_MODE.COLOR */] = 'color',
    _a[15 /* MIX_BLEND_MODE.LUMINOSITY */] = 'luminosity',
    _a);

var objectFit = {
    name: 'object-fit',
    initialValue: 'fill',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, objectFit) {
        switch (objectFit) {
            case 'contain':
                return "contain" /* OBJECT_FIT.CONTAIN */;
            case 'cover':
                return "cover" /* OBJECT_FIT.COVER */;
            case 'none':
                return "none" /* OBJECT_FIT.NONE */;
            case 'scale-down':
                return "scale-down" /* OBJECT_FIT.SCALE_DOWN */;
            case 'fill':
            default:
                return "fill" /* OBJECT_FIT.FILL */;
        }
    },
};

var opacity = {
    name: 'opacity',
    initialValue: '1',
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    prefix: false,
    parse: function (_context, token) {
        if (isNumberToken(token)) {
            return token.number;
        }
        return 1;
    },
};

var overflow = {
    name: 'overflow',
    initialValue: 'visible',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        return tokens.filter(isIdentToken).map(function (overflow) {
            switch (overflow.value) {
                case 'hidden':
                    return 1 /* OVERFLOW.HIDDEN */;
                case 'scroll':
                    return 2 /* OVERFLOW.SCROLL */;
                case 'clip':
                    return 3 /* OVERFLOW.CLIP */;
                case 'auto':
                    return 4 /* OVERFLOW.AUTO */;
                case 'visible':
                default:
                    return 0 /* OVERFLOW.VISIBLE */;
            }
        });
    },
};

var overflowWrap = {
    name: 'overflow-wrap',
    initialValue: 'normal',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, overflow) {
        switch (overflow) {
            case 'break-word':
                return "break-word" /* OVERFLOW_WRAP.BREAK_WORD */;
            case 'normal':
            default:
                return "normal" /* OVERFLOW_WRAP.NORMAL */;
        }
    },
};

var paddingForSide = function (side) { return ({
    name: "padding-".concat(side),
    initialValue: '0',
    prefix: false,
    type: 3 /* PropertyDescriptorParsingType.TYPE_VALUE */,
    format: 'length-percentage',
}); };
var paddingTop = paddingForSide('top');
var paddingRight = paddingForSide('right');
var paddingBottom = paddingForSide('bottom');
var paddingLeft = paddingForSide('left');

var paintOrder = {
    name: 'paint-order',
    initialValue: 'normal',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        var DEFAULT_VALUE = [0 /* PAINT_ORDER_LAYER.FILL */, 1 /* PAINT_ORDER_LAYER.STROKE */, 2 /* PAINT_ORDER_LAYER.MARKERS */];
        var layers = [];
        tokens.filter(isIdentToken).forEach(function (token) {
            switch (token.value) {
                case 'stroke':
                    layers.push(1 /* PAINT_ORDER_LAYER.STROKE */);
                    break;
                case 'fill':
                    layers.push(0 /* PAINT_ORDER_LAYER.FILL */);
                    break;
                case 'markers':
                    layers.push(2 /* PAINT_ORDER_LAYER.MARKERS */);
                    break;
            }
        });
        DEFAULT_VALUE.forEach(function (value) {
            if (layers.indexOf(value) === -1) {
                layers.push(value);
            }
        });
        return layers;
    },
};

var position = {
    name: 'position',
    initialValue: 'static',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, position) {
        switch (position) {
            case 'relative':
                return 1 /* POSITION.RELATIVE */;
            case 'absolute':
                return 2 /* POSITION.ABSOLUTE */;
            case 'fixed':
                return 3 /* POSITION.FIXED */;
            case 'sticky':
                return 4 /* POSITION.STICKY */;
        }
        return 0 /* POSITION.STATIC */;
    },
};

var quotes = {
    name: 'quotes',
    initialValue: 'none',
    prefix: true,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        if (tokens.length === 0) {
            return null;
        }
        var first = tokens[0];
        if (first.type === 20 /* TokenType.IDENT_TOKEN */ && first.value === 'none') {
            return null;
        }
        var quotes = [];
        var filtered = tokens.filter(isStringToken);
        if (filtered.length % 2 !== 0) {
            return null;
        }
        for (var i = 0; i < filtered.length; i += 2) {
            var open_1 = filtered[i].value;
            var close_1 = filtered[i + 1].value;
            quotes.push({ open: open_1, close: close_1 });
        }
        return quotes;
    },
};
var getQuote = function (quotes, depth, open) {
    if (!quotes) {
        return '';
    }
    var quote = quotes[Math.min(depth, quotes.length - 1)];
    if (!quote) {
        return '';
    }
    return open ? quote.open : quote.close;
};

var textAlign = {
    name: 'text-align',
    initialValue: 'left',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, textAlign) {
        switch (textAlign) {
            case 'right':
                return 2 /* TEXT_ALIGN.RIGHT */;
            case 'center':
            case 'justify':
                return 1 /* TEXT_ALIGN.CENTER */;
            case 'left':
            default:
                return 0 /* TEXT_ALIGN.LEFT */;
        }
    },
};

var textDecorationColor = {
    name: "text-decoration-color",
    initialValue: 'transparent',
    prefix: false,
    type: 3 /* PropertyDescriptorParsingType.TYPE_VALUE */,
    format: 'color',
};

var textDecorationLine = {
    name: 'text-decoration-line',
    initialValue: 'none',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        return tokens
            .filter(isIdentToken)
            .map(function (token) {
            switch (token.value) {
                case 'underline':
                    return 1 /* TEXT_DECORATION_LINE.UNDERLINE */;
                case 'overline':
                    return 2 /* TEXT_DECORATION_LINE.OVERLINE */;
                case 'line-through':
                    return 3 /* TEXT_DECORATION_LINE.LINE_THROUGH */;
                case 'blink':
                    return 4 /* TEXT_DECORATION_LINE.BLINK */;
                case 'none':
                default:
                    return 0 /* TEXT_DECORATION_LINE.NONE */;
            }
        })
            .filter(function (line) { return line !== 0 /* TEXT_DECORATION_LINE.NONE */; });
    },
};

var textDecorationStyle = {
    name: 'text-decoration-style',
    initialValue: 'solid',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, value) {
        switch (value) {
            case 'double':
                return 1 /* TEXT_DECORATION_STYLE.DOUBLE */;
            case 'dotted':
                return 2 /* TEXT_DECORATION_STYLE.DOTTED */;
            case 'dashed':
                return 3 /* TEXT_DECORATION_STYLE.DASHED */;
            case 'wavy':
                return 4 /* TEXT_DECORATION_STYLE.WAVY */;
            case 'solid':
            default:
                return 0 /* TEXT_DECORATION_STYLE.SOLID */;
        }
    },
};

var textDecorationThickness = {
    name: 'text-decoration-thickness',
    initialValue: 'auto',
    prefix: false,
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    parse: function (_context, token) {
        if (isIdentToken(token)) {
            if (token.value === 'from-font') {
                return 'from-font';
            }
            return 'auto';
        }
        if (isDimensionToken(token)) {
            return getNumber(token);
        }
        return 'auto';
    },
};

var textShadow = {
    name: 'text-shadow',
    initialValue: 'none',
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    prefix: false,
    parse: function (context, tokens) {
        if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
            return [];
        }
        return parseFunctionArgs(tokens).map(function (values) {
            var shadow = {
                color: COLORS.TRANSPARENT,
                offsetX: ZERO_LENGTH,
                offsetY: ZERO_LENGTH,
                blur: ZERO_LENGTH,
            };
            var c = 0;
            for (var i = 0; i < values.length; i++) {
                var token = values[i];
                if (isLength(token)) {
                    if (c === 0) {
                        shadow.offsetX = token;
                    }
                    else if (c === 1) {
                        shadow.offsetY = token;
                    }
                    else {
                        shadow.blur = token;
                    }
                    c++;
                }
                else {
                    shadow.color = color$1.parse(context, token);
                }
            }
            return shadow;
        });
    },
};

var textTransform = {
    name: 'text-transform',
    initialValue: 'none',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, textTransform) {
        switch (textTransform) {
            case 'uppercase':
                return 2 /* TEXT_TRANSFORM.UPPERCASE */;
            case 'lowercase':
                return 1 /* TEXT_TRANSFORM.LOWERCASE */;
            case 'capitalize':
                return 3 /* TEXT_TRANSFORM.CAPITALIZE */;
            case 'full-width':
                return 4 /* TEXT_TRANSFORM.FULL_WIDTH */;
            case 'full-size-kana':
                return 5 /* TEXT_TRANSFORM.FULL_SIZE_KANA */;
            case 'math-auto':
                return 6 /* TEXT_TRANSFORM.MATH_AUTO */;
            default:
                return 0 /* TEXT_TRANSFORM.NONE */;
        }
    },
};

var transform$1 = {
    name: 'transform',
    initialValue: 'none',
    prefix: true,
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    parse: function (_context, token) {
        if (token.type === 20 /* TokenType.IDENT_TOKEN */ && token.value === 'none') {
            return null;
        }
        if (token.type === 18 /* TokenType.FUNCTION */) {
            var transformFunction = SUPPORTED_TRANSFORM_FUNCTIONS[token.name];
            if (typeof transformFunction === 'undefined') {
                throw new Error("Attempting to parse an unsupported transform function \"".concat(token.name, "\""));
            }
            return transformFunction(token.values);
        }
        return null;
    },
};
// ─── helpers ────────────────────────────────────────────────────────────────
/** Extract numeric values from a token list (NUMBER_TOKEN only). */
var numbers = function (args) {
    return args.filter(function (arg) { return arg.type === 17 /* TokenType.NUMBER_TOKEN */; }).map(function (arg) { return arg.number; });
};
/** Parse a length token to pixels. Browsers always resolve lengths to px before
 *  exposing them via getComputedStyle, so the unit is virtually always 'px'.
 *  Falls back to 0 for unrecognised units. */
var lengthToPx = function (token) {
    if (token.type === 15 /* TokenType.DIMENSION_TOKEN */) {
        return token.number;
    }
    if (token.type === 17 /* TokenType.NUMBER_TOKEN */) {
        return token.number;
    }
    return 0;
};
/** Parse an angle token (deg / grad / rad / turn) and return radians. */
var angleToRad = function (token) {
    if (token.type === 15 /* TokenType.DIMENSION_TOKEN */) {
        var dim = token;
        switch (dim.unit) {
            case 'deg':
                return (Math.PI * dim.number) / 180;
            case 'grad':
                return (Math.PI / 200) * dim.number;
            case 'rad':
                return dim.number;
            case 'turn':
                return Math.PI * 2 * dim.number;
        }
    }
    // <number> 0 is a valid angle
    if (token.type === 17 /* TokenType.NUMBER_TOKEN */) {
        return token.number;
    }
    return 0;
};
/** Find the first length/dimension token in a list. */
var firstLength = function (args) {
    var t = args.find(function (a) { return a.type === 15 /* TokenType.DIMENSION_TOKEN */ || a.type === 17 /* TokenType.NUMBER_TOKEN */; });
    return t ? lengthToPx(t) : 0;
};
/** Find all length/dimension tokens in a list. */
var allLengths = function (args) {
    return args.filter(function (a) { return a.type === 15 /* TokenType.DIMENSION_TOKEN */ || a.type === 17 /* TokenType.NUMBER_TOKEN */; }).map(lengthToPx);
};
/** Find the first angle token in a list. */
var firstAngle = function (args) {
    var t = args.find(function (a) { return isAngle(a) || a.type === 17 /* TokenType.NUMBER_TOKEN */; });
    return t ? angleToRad(t) : 0;
};
/** Find all angle tokens in a list. */
var allAngles = function (args) {
    return args.filter(function (a) { return isAngle(a) || a.type === 17 /* TokenType.NUMBER_TOKEN */; }).map(angleToRad);
};
// ─── CSS Transform Level 1 ──────────────────────────────────────────────────
/** matrix(a, b, c, d, e, f) */
var matrix = function (args) {
    var values = numbers(args);
    return values.length === 6 ? values : null;
};
/** translate(tx, ty?) — ty defaults to 0 */
var translate = function (args) {
    var _a, _b;
    var values = allLengths(args);
    var tx = (_a = values[0]) !== null && _a !== void 0 ? _a : 0;
    var ty = (_b = values[1]) !== null && _b !== void 0 ? _b : 0;
    return [1, 0, 0, 1, tx, ty];
};
/** translateX(tx) */
var translateX = function (args) { return [1, 0, 0, 1, firstLength(args), 0]; };
/** translateY(ty) */
var translateY = function (args) { return [1, 0, 0, 1, 0, firstLength(args)]; };
/** scale(sx, sy?) — sy defaults to sx */
var scale = function (args) {
    var _a, _b;
    var values = numbers(args);
    var sx = (_a = values[0]) !== null && _a !== void 0 ? _a : 1;
    var sy = (_b = values[1]) !== null && _b !== void 0 ? _b : sx;
    return [sx, 0, 0, sy, 0, 0];
};
/** scaleX(sx) */
var scaleX = function (args) {
    var _a;
    var sx = (_a = numbers(args)[0]) !== null && _a !== void 0 ? _a : 1;
    return [sx, 0, 0, 1, 0, 0];
};
/** scaleY(sy) */
var scaleY = function (args) {
    var _a;
    var sy = (_a = numbers(args)[0]) !== null && _a !== void 0 ? _a : 1;
    return [1, 0, 0, sy, 0, 0];
};
/** rotate(angle) */
var rotate = function (args) {
    var a = firstAngle(args);
    var c = Math.cos(a);
    // Math.sin(0) returns -0 on some engines; normalize to avoid -0 in output
    var s = a === 0 ? 0 : Math.sin(a);
    return [c, s, -s, c, 0, 0];
};
/** skew(ax, ay?) — ay defaults to 0 */
var skew = function (args) {
    var _a, _b;
    var angles = allAngles(args);
    var ax = (_a = angles[0]) !== null && _a !== void 0 ? _a : 0;
    var ay = (_b = angles[1]) !== null && _b !== void 0 ? _b : 0;
    return [1, Math.tan(ay), Math.tan(ax), 1, 0, 0];
};
/** skewX(angle) */
var skewX = function (args) { return [1, 0, Math.tan(firstAngle(args)), 1, 0, 0]; };
/** skewY(angle) */
var skewY = function (args) { return [1, Math.tan(firstAngle(args)), 0, 1, 0, 0]; };
// ─── CSS Transform Level 2 (3D — projected to 2D) ───────────────────────────
/** matrix3d(…16 values…) — extract the 2D-relevant components */
var matrix3d = function (args) {
    var values = numbers(args);
    var a1 = values[0], b1 = values[1], a2 = values[4], b2 = values[5], a4 = values[12], b4 = values[13];
    return values.length === 16 ? [a1, b1, a2, b2, a4, b4] : null;
};
/** translate3d(tx, ty, tz) — tz is ignored (no depth in 2D canvas) */
var translate3d = function (args) {
    var _a, _b;
    var values = allLengths(args);
    return [1, 0, 0, 1, (_a = values[0]) !== null && _a !== void 0 ? _a : 0, (_b = values[1]) !== null && _b !== void 0 ? _b : 0];
};
/** translateZ(tz) — no-op in 2D */
var translateZ = function (_args) { return [1, 0, 0, 1, 0, 0]; };
/** scale3d(sx, sy, sz) — sz is ignored */
var scale3d = function (args) {
    var _a, _b;
    var values = numbers(args);
    return [(_a = values[0]) !== null && _a !== void 0 ? _a : 1, 0, 0, (_b = values[1]) !== null && _b !== void 0 ? _b : 1, 0, 0];
};
/** scaleZ(sz) — no-op in 2D */
var scaleZ = function (_args) { return [1, 0, 0, 1, 0, 0]; };
/** rotateZ(angle) — identical to rotate() */
var rotateZ = function (args) { return rotate(args); };
/** rotateX(angle) — no visible effect when projected to 2D */
var rotateX = function (_args) { return [1, 0, 0, 1, 0, 0]; };
/** rotateY(angle) — no visible effect when projected to 2D */
var rotateY = function (_args) { return [1, 0, 0, 1, 0, 0]; };
/** rotate3d(x, y, z, angle)
 *  Only the common case x=0,y=0,z≠0 maps cleanly to a 2D rotation.
 *  All other axis combinations produce a partial projection and are treated
 *  as identity. */
var rotate3d = function (args) {
    var nums = numbers(args);
    // The angle is always a DIMENSION_TOKEN (deg/rad/…); NUMBER_TOKEN values
    // are the x/y/z components — so we must NOT use allAngles() which would
    // also pick up the plain NUMBER_TOKENs.
    var angleDim = args.find(function (a) { return isAngle(a); });
    var a = angleDim ? angleToRad(angleDim) : 0;
    var x = nums[0], y = nums[1], z = nums[2];
    // z-axis rotation maps directly to 2D rotate
    if (x === 0 && y === 0 && z !== 0) {
        var c = Math.cos(a);
        var s = Math.sin(a);
        return [c, s, -s, c, 0, 0];
    }
    return [1, 0, 0, 1, 0, 0];
};
/** perspective(d) — no-op in 2D canvas rendering */
var perspective = function (_args) { return [1, 0, 0, 1, 0, 0]; };
// ─── function map ────────────────────────────────────────────────────────────
var SUPPORTED_TRANSFORM_FUNCTIONS = {
    // Level 1
    matrix: matrix,
    translate: translate,
    translateX: translateX,
    translateY: translateY,
    scale: scale,
    scaleX: scaleX,
    scaleY: scaleY,
    rotate: rotate,
    skew: skew,
    skewX: skewX,
    skewY: skewY,
    // Level 2
    matrix3d: matrix3d,
    translate3d: translate3d,
    translateZ: translateZ,
    scale3d: scale3d,
    scaleZ: scaleZ,
    rotateZ: rotateZ,
    rotateX: rotateX,
    rotateY: rotateY,
    rotate3d: rotate3d,
    perspective: perspective,
};

var DEFAULT_VALUE = {
    type: 16 /* TokenType.PERCENTAGE_TOKEN */,
    number: 50,
    flags: FLAG_INTEGER,
};
var DEFAULT = [DEFAULT_VALUE, DEFAULT_VALUE];
var transformOrigin = {
    name: 'transform-origin',
    initialValue: '50% 50%',
    prefix: true,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: function (_context, tokens) {
        var origins = tokens.filter(isLengthPercentage);
        if (origins.length !== 2) {
            return DEFAULT;
        }
        return [origins[0], origins[1]];
    },
};

var visibility = {
    name: 'visible',
    initialValue: 'none',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, visibility) {
        switch (visibility) {
            case 'hidden':
                return 1 /* VISIBILITY.HIDDEN */;
            case 'collapse':
                return 2 /* VISIBILITY.COLLAPSE */;
            case 'visible':
            default:
                return 0 /* VISIBILITY.VISIBLE */;
        }
    },
};

var webkitTextStrokeColor = {
    name: "-webkit-text-stroke-color",
    initialValue: 'currentcolor',
    prefix: false,
    type: 3 /* PropertyDescriptorParsingType.TYPE_VALUE */,
    format: 'color',
};

var webkitTextStrokeWidth = {
    name: "-webkit-text-stroke-width",
    initialValue: '0',
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    prefix: false,
    parse: function (_context, token) {
        if (isDimensionToken(token)) {
            return token.number;
        }
        return 0;
    },
};

var WORD_BREAK;
(function (WORD_BREAK) {
    WORD_BREAK["NORMAL"] = "normal";
    WORD_BREAK["BREAK_ALL"] = "break-all";
    WORD_BREAK["KEEP_ALL"] = "keep-all";
})(WORD_BREAK || (WORD_BREAK = {}));
var wordBreak = {
    name: 'word-break',
    initialValue: 'normal',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, wordBreak) {
        switch (wordBreak) {
            case 'break-all':
                return WORD_BREAK.BREAK_ALL;
            case 'keep-all':
                return WORD_BREAK.KEEP_ALL;
            case 'normal':
            default:
                return WORD_BREAK.NORMAL;
        }
    },
};

var writingMode = {
    name: 'writing-mode',
    initialValue: 'horizontal-tb',
    prefix: false,
    type: 2 /* PropertyDescriptorParsingType.IDENT_VALUE */,
    parse: function (_context, mode) {
        switch (mode) {
            case 'vertical-rl':
                return 1 /* WRITING_MODE.VERTICAL_RL */;
            case 'vertical-lr':
                return 2 /* WRITING_MODE.VERTICAL_LR */;
            case 'sideways-rl':
                return 3 /* WRITING_MODE.SIDEWAYS_RL */;
            case 'sideways-lr':
                return 4 /* WRITING_MODE.SIDEWAYS_LR */;
            case 'horizontal-tb':
            default:
                return 0 /* WRITING_MODE.HORIZONTAL_TB */;
        }
    },
};

var zIndex = {
    name: 'z-index',
    initialValue: 'auto',
    prefix: false,
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    parse: function (_context, token) {
        if (token.type === 20 /* TokenType.IDENT_TOKEN */) {
            return { auto: true, order: 0 };
        }
        if (isNumberToken(token)) {
            return { auto: false, order: token.number };
        }
        throw new Error("Invalid z-index number parsed");
    },
};

var CSSParsedDeclaration = /** @class */ (function () {
    function CSSParsedDeclaration(context, declaration) {
        var _a, _b;
        this.animationDuration = parse(context, duration, declaration.animationDuration);
        this.backgroundClip = parse(context, backgroundClip, declaration.backgroundClip);
        this.backgroundBlendMode = parse(context, backgroundBlendMode, declaration.backgroundBlendMode);
        this.backgroundColor = parse(context, backgroundColor, declaration.backgroundColor);
        this.backgroundImage = parse(context, backgroundImage, declaration.backgroundImage);
        this.backgroundOrigin = parse(context, backgroundOrigin, declaration.backgroundOrigin);
        this.backgroundPosition = parse(context, backgroundPosition, declaration.backgroundPosition);
        this.backgroundRepeat = parse(context, backgroundRepeat, declaration.backgroundRepeat);
        this.backgroundSize = parse(context, backgroundSize, declaration.backgroundSize);
        this.borderTopColor = parse(context, borderTopColor, declaration.borderTopColor);
        this.borderRightColor = parse(context, borderRightColor, declaration.borderRightColor);
        this.borderBottomColor = parse(context, borderBottomColor, declaration.borderBottomColor);
        this.borderLeftColor = parse(context, borderLeftColor, declaration.borderLeftColor);
        this.borderTopLeftRadius = parse(context, borderTopLeftRadius, declaration.borderTopLeftRadius);
        this.borderTopRightRadius = parse(context, borderTopRightRadius, declaration.borderTopRightRadius);
        this.borderBottomRightRadius = parse(context, borderBottomRightRadius, declaration.borderBottomRightRadius);
        this.borderBottomLeftRadius = parse(context, borderBottomLeftRadius, declaration.borderBottomLeftRadius);
        this.borderTopStyle = parse(context, borderTopStyle, declaration.borderTopStyle);
        this.borderRightStyle = parse(context, borderRightStyle, declaration.borderRightStyle);
        this.borderBottomStyle = parse(context, borderBottomStyle, declaration.borderBottomStyle);
        this.borderLeftStyle = parse(context, borderLeftStyle, declaration.borderLeftStyle);
        this.borderTopWidth = parse(context, borderTopWidth, declaration.borderTopWidth);
        this.borderRightWidth = parse(context, borderRightWidth, declaration.borderRightWidth);
        this.borderBottomWidth = parse(context, borderBottomWidth, declaration.borderBottomWidth);
        this.borderLeftWidth = parse(context, borderLeftWidth, declaration.borderLeftWidth);
        this.boxShadow = parse(context, boxShadow, declaration.boxShadow);
        this.color = parse(context, color, declaration.color);
        this.direction = parse(context, direction, declaration.direction);
        this.display = parse(context, display, declaration.display);
        this.float = parse(context, float, declaration.cssFloat);
        this.filter = parse(context, filter, declaration.filter);
        this.fontFamily = parse(context, fontFamily, declaration.fontFamily);
        this.fontSize = parse(context, fontSize, declaration.fontSize);
        this.fontStyle = parse(context, fontStyle, declaration.fontStyle);
        this.fontVariant = parse(context, fontVariant, declaration.fontVariant);
        this.fontWeight = parse(context, fontWeight, declaration.fontWeight);
        this.letterSpacing = parse(context, letterSpacing, declaration.letterSpacing);
        this.lineBreak = parse(context, lineBreak, declaration.lineBreak);
        this.lineHeight = parse(context, lineHeight, declaration.lineHeight);
        this.listStyleImage = parse(context, listStyleImage, declaration.listStyleImage);
        this.listStylePosition = parse(context, listStylePosition, declaration.listStylePosition);
        this.listStyleType = parse(context, listStyleType, declaration.listStyleType);
        this.marginTop = parse(context, marginTop, declaration.marginTop);
        this.marginRight = parse(context, marginRight, declaration.marginRight);
        this.marginBottom = parse(context, marginBottom, declaration.marginBottom);
        this.marginLeft = parse(context, marginLeft, declaration.marginLeft);
        this.objectFit = parse(context, objectFit, declaration.objectFit);
        this.opacity = parse(context, opacity, declaration.opacity);
        this.mixBlendMode = parse(context, mixBlendMode, declaration.mixBlendMode);
        var overflowTuple = parse(context, overflow, declaration.overflow);
        this.overflowX = overflowTuple[0];
        this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
        this.overflowWrap = parse(context, overflowWrap, declaration.overflowWrap);
        this.paddingTop = parse(context, paddingTop, declaration.paddingTop);
        this.paddingRight = parse(context, paddingRight, declaration.paddingRight);
        this.paddingBottom = parse(context, paddingBottom, declaration.paddingBottom);
        this.paddingLeft = parse(context, paddingLeft, declaration.paddingLeft);
        this.paintOrder = parse(context, paintOrder, declaration.paintOrder);
        this.position = parse(context, position, declaration.position);
        this.textAlign = parse(context, textAlign, declaration.textAlign);
        this.textDecorationColor = parse(context, textDecorationColor, (_a = declaration.textDecorationColor) !== null && _a !== void 0 ? _a : declaration.color);
        this.textDecorationLine = parse(context, textDecorationLine, (_b = declaration.textDecorationLine) !== null && _b !== void 0 ? _b : declaration.textDecoration);
        this.textDecorationStyle = parse(context, textDecorationStyle, declaration.textDecorationStyle);
        this.textDecorationThickness = parse(context, textDecorationThickness, declaration.textDecorationThickness);
        this.textShadow = parse(context, textShadow, declaration.textShadow);
        this.textTransform = parse(context, textTransform, declaration.textTransform);
        this.transform = parse(context, transform$1, declaration.transform);
        this.transformOrigin = parse(context, transformOrigin, declaration.transformOrigin);
        this.visibility = parse(context, visibility, declaration.visibility);
        this.webkitTextStrokeColor = parse(context, webkitTextStrokeColor, declaration.webkitTextStrokeColor);
        this.webkitTextStrokeWidth = parse(context, webkitTextStrokeWidth, declaration.webkitTextStrokeWidth);
        this.wordBreak = parse(context, wordBreak, declaration.wordBreak);
        this.writingMode = parse(context, writingMode, declaration.writingMode);
        this.zIndex = parse(context, zIndex, declaration.zIndex);
    }
    CSSParsedDeclaration.prototype.isVisible = function () {
        return this.display > 0 && this.opacity > 0 && this.visibility === 0 /* VISIBILITY.VISIBLE */;
    };
    CSSParsedDeclaration.prototype.isTransparent = function () {
        return isTransparent(this.backgroundColor);
    };
    CSSParsedDeclaration.prototype.isTransformed = function () {
        return this.transform !== null;
    };
    CSSParsedDeclaration.prototype.isFiltered = function () {
        return this.filter.length > 0;
    };
    CSSParsedDeclaration.prototype.isPositioned = function () {
        return this.position !== 0 /* POSITION.STATIC */;
    };
    CSSParsedDeclaration.prototype.isPositionedWithZIndex = function () {
        return this.isPositioned() && !this.zIndex.auto;
    };
    CSSParsedDeclaration.prototype.isFloating = function () {
        return this.float !== 0 /* FLOAT.NONE */;
    };
    CSSParsedDeclaration.prototype.isInlineLevel = function () {
        return (contains(this.display, 4 /* DISPLAY.INLINE */) ||
            contains(this.display, 33554432 /* DISPLAY.INLINE_BLOCK */) ||
            contains(this.display, 268435456 /* DISPLAY.INLINE_FLEX */) ||
            contains(this.display, 536870912 /* DISPLAY.INLINE_GRID */) ||
            contains(this.display, 67108864 /* DISPLAY.INLINE_LIST_ITEM */) ||
            contains(this.display, 134217728 /* DISPLAY.INLINE_TABLE */));
    };
    return CSSParsedDeclaration;
}());
var CSSParsedPseudoDeclaration = /** @class */ (function () {
    function CSSParsedPseudoDeclaration(context, declaration) {
        this.content = parse(context, content, declaration.content);
        this.quotes = parse(context, quotes, declaration.quotes);
    }
    return CSSParsedPseudoDeclaration;
}());
var CSSParsedCounterDeclaration = /** @class */ (function () {
    function CSSParsedCounterDeclaration(context, declaration) {
        this.counterIncrement = parse(context, counterIncrement, declaration.counterIncrement);
        this.counterReset = parse(context, counterReset, declaration.counterReset);
    }
    return CSSParsedCounterDeclaration;
}());
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var parse = function (context, descriptor, style) {
    var value = style !== null && typeof style !== 'undefined' ? style.toString() : descriptor.initialValue;
    // Fast-path for IDENT_VALUE: skip tokenization when the value is a simple identifier
    if (descriptor.type === 2 /* PropertyDescriptorParsingType.IDENT_VALUE */) {
        // Simple ident values contain only letters, hyphens, and don't need full parsing
        if (/^[a-zA-Z-]+$/.test(value)) {
            return descriptor.parse(context, value);
        }
    }
    var tokenizer = new Tokenizer();
    tokenizer.write(value);
    var parser = new Parser(tokenizer.read());
    switch (descriptor.type) {
        case 2 /* PropertyDescriptorParsingType.IDENT_VALUE */:
            var token = parser.parseComponentValue();
            return descriptor.parse(context, isIdentToken(token) ? token.value : descriptor.initialValue);
        case 0 /* PropertyDescriptorParsingType.VALUE */:
            return descriptor.parse(context, parser.parseComponentValue());
        case 1 /* PropertyDescriptorParsingType.LIST */:
            return descriptor.parse(context, parser.parseComponentValues());
        case 4 /* PropertyDescriptorParsingType.TOKEN_VALUE */:
            return parser.parseComponentValue();
        case 3 /* PropertyDescriptorParsingType.TYPE_VALUE */:
            switch (descriptor.format) {
                case 'angle':
                    return angle.parse(context, parser.parseComponentValue());
                case 'color':
                    return color$1.parse(context, parser.parseComponentValue());
                case 'image':
                    return image.parse(context, parser.parseComponentValue());
                case 'length':
                    var length_1 = parser.parseComponentValue();
                    return isLength(length_1) ? length_1 : ZERO_LENGTH;
                case 'length-percentage':
                    var lpValue = parser.parseComponentValue();
                    return isLengthPercentage(lpValue) ? lpValue : ZERO_LENGTH;
                case 'time':
                    return time.parse(context, parser.parseComponentValue());
            }
    }
};

var Bounds = /** @class */ (function () {
    function Bounds(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    Bounds.prototype.add = function (x, y, w, h) {
        return new Bounds(this.left + x, this.top + y, this.width + w, this.height + h);
    };
    Bounds.fromClientRect = function (context, clientRect) {
        return new Bounds(clientRect.left + context.windowBounds.left, clientRect.top + context.windowBounds.top, clientRect.width, clientRect.height);
    };
    Bounds.fromDOMRectList = function (context, domRectList) {
        var domRect = Array.from(domRectList).find(function (rect) { return rect.width !== 0; });
        return domRect
            ? new Bounds(domRect.left + context.windowBounds.left, domRect.top + context.windowBounds.top, domRect.width, domRect.height)
            : Bounds.EMPTY;
    };
    Bounds.EMPTY = new Bounds(0, 0, 0, 0);
    return Bounds;
}());
var parseBounds = function (context, node) {
    return Bounds.fromClientRect(context, node.getBoundingClientRect());
};
var parseDocumentSize = function (document) {
    var body = document.body;
    var documentElement = document.documentElement;
    if (!body || !documentElement) {
        throw new Error("Unable to get document size");
    }
    var width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));
    var height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));
    return new Bounds(0, 0, width, height);
};

var elementDebuggerAttribute = 'data-html2canvas-debug';
var getElementDebugType = function (element) {
    var attribute = element.getAttribute(elementDebuggerAttribute);
    switch (attribute) {
        case 'all':
            return 1 /* DebuggerType.ALL */;
        case 'clone':
            return 2 /* DebuggerType.CLONE */;
        case 'parse':
            return 3 /* DebuggerType.PARSE */;
        case 'render':
            return 4 /* DebuggerType.RENDER */;
        default:
            return 0 /* DebuggerType.NONE */;
    }
};
var isDebugging = function (element, type) {
    var elementType = getElementDebugType(element);
    return elementType === 1 /* DebuggerType.ALL */ || type === elementType;
};

var ElementContainer = /** @class */ (function () {
    function ElementContainer(context, element) {
        this.context = context;
        this.textNodes = [];
        this.elements = [];
        this.flags = 0;
        if (isDebugging(element, 3 /* DebuggerType.PARSE */)) {
            debugger;
        }
        this.styles = new CSSParsedDeclaration(context, window.getComputedStyle(element, null));
        if (isHTMLElementNode(element)) {
            if (this.styles.animationDuration.some(function (duration) { return duration > 0; })) {
                element.style.animationDuration = '0s';
            }
            if (this.styles.transform !== null) {
                // getBoundingClientRect takes transforms into account
                element.style.transform = 'none';
            }
        }
        this.bounds = parseBounds(this.context, element);
        if (isDebugging(element, 4 /* DebuggerType.RENDER */)) {
            this.flags |= 16 /* FLAGS.DEBUG_RENDER */;
        }
    }
    return ElementContainer;
}());

var LIElementContainer = /** @class */ (function (_super) {
    __extends(LIElementContainer, _super);
    function LIElementContainer(context, element) {
        var _this = _super.call(this, context, element) || this;
        _this.value = element.value;
        return _this;
    }
    return LIElementContainer;
}(ElementContainer));

var OLElementContainer = /** @class */ (function (_super) {
    __extends(OLElementContainer, _super);
    function OLElementContainer(context, element) {
        var _this = _super.call(this, context, element) || this;
        _this.start = element.start;
        _this.reversed = typeof element.reversed === 'boolean' && element.reversed === true;
        return _this;
    }
    return OLElementContainer;
}(ElementContainer));

var SelectElementContainer = /** @class */ (function (_super) {
    __extends(SelectElementContainer, _super);
    function SelectElementContainer(context, element) {
        var _this = _super.call(this, context, element) || this;
        var option = element.options[element.selectedIndex || 0];
        _this.value = option ? option.text || '' : '';
        return _this;
    }
    return SelectElementContainer;
}(ElementContainer));

var TextareaElementContainer = /** @class */ (function (_super) {
    __extends(TextareaElementContainer, _super);
    function TextareaElementContainer(context, element) {
        var _this = _super.call(this, context, element) || this;
        _this.value = element.value;
        _this.scrollTop = element.scrollTop;
        return _this;
    }
    return TextareaElementContainer;
}(ElementContainer));

var CanvasElementContainer = /** @class */ (function (_super) {
    __extends(CanvasElementContainer, _super);
    function CanvasElementContainer(context, canvas) {
        var _this = _super.call(this, context, canvas) || this;
        _this.canvas = canvas;
        _this.intrinsicWidth = canvas.width;
        _this.intrinsicHeight = canvas.height;
        return _this;
    }
    return CanvasElementContainer;
}(ElementContainer));

var IFrameElementContainer = /** @class */ (function (_super) {
    __extends(IFrameElementContainer, _super);
    function IFrameElementContainer(context, iframe) {
        var _this = _super.call(this, context, iframe) || this;
        _this.src = iframe.src;
        _this.width = parseInt(iframe.width, 10) || iframe.offsetWidth || 0;
        _this.height = parseInt(iframe.height, 10) || iframe.offsetHeight || 0;
        _this.backgroundColor = _this.styles.backgroundColor;
        try {
            if (iframe.contentWindow &&
                iframe.contentWindow.document &&
                iframe.contentWindow.document.documentElement) {
                _this.tree = parseTree(context, iframe.contentWindow.document.documentElement);
                // http://www.w3.org/TR/css3-background/#special-backgrounds
                var documentBackgroundColor = iframe.contentWindow.document.documentElement
                    ? parseColor(context, getComputedStyle(iframe.contentWindow.document.documentElement).backgroundColor)
                    : COLORS.TRANSPARENT;
                var bodyBackgroundColor = iframe.contentWindow.document.body
                    ? parseColor(context, getComputedStyle(iframe.contentWindow.document.body).backgroundColor)
                    : COLORS.TRANSPARENT;
                _this.backgroundColor = isTransparent(documentBackgroundColor)
                    ? isTransparent(bodyBackgroundColor)
                        ? _this.styles.backgroundColor
                        : bodyBackgroundColor
                    : documentBackgroundColor;
            }
        }
        catch (e) { }
        return _this;
    }
    return IFrameElementContainer;
}(ElementContainer));

var ImageElementContainer = /** @class */ (function (_super) {
    __extends(ImageElementContainer, _super);
    function ImageElementContainer(context, img) {
        var _this = _super.call(this, context, img) || this;
        _this.intrinsicWidth = 0;
        _this.intrinsicHeight = 0;
        _this.isInlinedSvg = function () { return ImageElementContainer.INLINED_SVG.test(_this.src); };
        _this.isSvg = function () { return ImageElementContainer.SVG.test(_this.src); };
        _this.src = img.currentSrc || img.src;
        _this.isSVG = _this.isSvg() || _this.isInlinedSvg();
        _this.context.cache.addImage(_this.src);
        return _this;
    }
    ImageElementContainer.prototype.setup = function (img) {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.isSvg()) {
                resolve();
            }
            else if (_this.isInlinedSvg()) {
                var svgElement = deserializeSvg(_this.src);
                var widthBaseVal = svgElement.width.baseVal, heightBaseVal = svgElement.height.baseVal;
                if (ImageElementContainer.IS_FIRE_FOX) {
                    widthBaseVal.valueAsString = widthBaseVal.value.toString();
                    heightBaseVal.valueAsString = heightBaseVal.value.toString();
                    img.src = serializeSvg(svgElement, 'base64');
                }
                _this.intrinsicWidth = widthBaseVal.value;
                _this.intrinsicHeight = heightBaseVal.value;
                resolve();
            }
            else {
                _this.intrinsicWidth = img.naturalWidth;
                _this.intrinsicHeight = img.naturalHeight;
                if (_this.intrinsicWidth && _this.intrinsicHeight) {
                    resolve();
                }
                else {
                    //This might never happen, as the image is already loaded after the cache is awaited in canvas-renderer.ts/renderNodeContent, cache-storage.ts/Cache.loadImage does it
                    img.addEventListener('load', function (_event) {
                        _this.intrinsicWidth = img.naturalWidth;
                        _this.intrinsicHeight = img.naturalHeight;
                        resolve();
                    });
                }
            }
        });
    };
    ImageElementContainer.SVG = /\.svg(?:\?.*)?$/i;
    ImageElementContainer.INLINED_SVG = /^data:image\/svg\+xml/i;
    ImageElementContainer.IS_FIRE_FOX = /firefox/i.test(navigator === null || navigator === void 0 ? void 0 : navigator.userAgent);
    return ImageElementContainer;
}(ElementContainer));

var CHECKBOX_BORDER_RADIUS = [
    {
        type: 15 /* TokenType.DIMENSION_TOKEN */,
        flags: 0,
        unit: 'px',
        number: 3,
    },
];
var RADIO_BORDER_RADIUS = [
    {
        type: 16 /* TokenType.PERCENTAGE_TOKEN */,
        flags: 0,
        number: 50,
    },
];
var reformatInputBounds = function (bounds) {
    if (bounds.width > bounds.height) {
        return new Bounds(bounds.left + (bounds.width - bounds.height) / 2, bounds.top, bounds.height, bounds.height);
    }
    else if (bounds.width < bounds.height) {
        return new Bounds(bounds.left, bounds.top + (bounds.height - bounds.width) / 2, bounds.width, bounds.width);
    }
    return bounds;
};
var getInputValue = function (node) {
    var value = node.type === PASSWORD ? new Array(node.value.length + 1).join('\u2022') : node.value;
    return value.length === 0 ? node.placeholder || '' : value;
};
var CHECKBOX = 'checkbox';
var RADIO = 'radio';
var PASSWORD = 'password';
var RANGE = 'range';
var INPUT_COLOR = 0x2a2a2aff;
var InputElementContainer = /** @class */ (function (_super) {
    __extends(InputElementContainer, _super);
    function InputElementContainer(context, input) {
        var _this = _super.call(this, context, input) || this;
        _this.type = input.type.toLowerCase();
        _this.checked = input.checked;
        _this.value = getInputValue(input);
        _this.min = parseFloat(input.min) || 0;
        _this.max = parseFloat(input.max) || 100;
        _this.valueAsNumber = isNaN(input.valueAsNumber) ? (_this.min + _this.max) / 2 : input.valueAsNumber;
        if (_this.type === CHECKBOX || _this.type === RADIO) {
            _this.styles.backgroundColor = 0xdededeff;
            _this.styles.borderTopColor =
                _this.styles.borderRightColor =
                    _this.styles.borderBottomColor =
                        _this.styles.borderLeftColor =
                            0xa5a5a5ff;
            _this.styles.borderTopWidth =
                _this.styles.borderRightWidth =
                    _this.styles.borderBottomWidth =
                        _this.styles.borderLeftWidth =
                            1;
            _this.styles.borderTopStyle =
                _this.styles.borderRightStyle =
                    _this.styles.borderBottomStyle =
                        _this.styles.borderLeftStyle =
                            1 /* BORDER_STYLE.SOLID */;
            _this.styles.backgroundClip = [0 /* BACKGROUND_CLIP.BORDER_BOX */];
            _this.styles.backgroundOrigin = [0 /* BACKGROUND_ORIGIN.BORDER_BOX */];
            _this.bounds = reformatInputBounds(_this.bounds);
        }
        switch (_this.type) {
            case CHECKBOX:
                _this.styles.borderTopRightRadius =
                    _this.styles.borderTopLeftRadius =
                        _this.styles.borderBottomRightRadius =
                            _this.styles.borderBottomLeftRadius =
                                CHECKBOX_BORDER_RADIUS;
                break;
            case RADIO:
                _this.styles.borderTopRightRadius =
                    _this.styles.borderTopLeftRadius =
                        _this.styles.borderBottomRightRadius =
                            _this.styles.borderBottomLeftRadius =
                                RADIO_BORDER_RADIUS;
                break;
        }
        return _this;
    }
    return InputElementContainer;
}(ElementContainer));

var MeterElementContainer = /** @class */ (function (_super) {
    __extends(MeterElementContainer, _super);
    function MeterElementContainer(context, element) {
        var _this = _super.call(this, context, element) || this;
        _this.value = element.value;
        _this.min = element.min;
        _this.max = element.max;
        _this.low = element.low;
        _this.high = element.high;
        _this.optimum = element.optimum;
        return _this;
    }
    Object.defineProperty(MeterElementContainer.prototype, "ratio", {
        get: function () {
            var range = this.max - this.min;
            return range > 0 ? Math.min(Math.max((this.value - this.min) / range, 0), 1) : 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeterElementContainer.prototype, "state", {
        get: function () {
            // Determine the meter state based on CSS meter pseudo-class semantics
            var _a = this, value = _a.value, low = _a.low, high = _a.high, optimum = _a.optimum;
            // Determine which region the optimum is in
            var optimumInLow = optimum <= low;
            var optimumInHigh = optimum >= high;
            // Determine which region the value is in
            var valueInLow = value <= low;
            var valueInHigh = value >= high;
            var valueInMiddle = value > low && value < high;
            if (optimumInLow) {
                if (valueInLow)
                    return 0 /* METER_STATE.OPTIMUM */;
                if (valueInMiddle)
                    return 1 /* METER_STATE.SUBOPTIMUM */;
                return 2 /* METER_STATE.CRITICAL */;
            }
            if (optimumInHigh) {
                if (valueInHigh)
                    return 0 /* METER_STATE.OPTIMUM */;
                if (valueInMiddle)
                    return 1 /* METER_STATE.SUBOPTIMUM */;
                return 2 /* METER_STATE.CRITICAL */;
            }
            // Optimum is in middle
            if (valueInMiddle || value === low || value === high)
                return 0 /* METER_STATE.OPTIMUM */;
            return 1 /* METER_STATE.SUBOPTIMUM */;
        },
        enumerable: false,
        configurable: true
    });
    return MeterElementContainer;
}(ElementContainer));

var ProgressElementContainer = /** @class */ (function (_super) {
    __extends(ProgressElementContainer, _super);
    function ProgressElementContainer(context, element) {
        var _this = _super.call(this, context, element) || this;
        _this.value = element.value;
        _this.max = element.max;
        return _this;
    }
    Object.defineProperty(ProgressElementContainer.prototype, "ratio", {
        get: function () {
            return this.max > 0 ? Math.min(this.value / this.max, 1) : 0;
        },
        enumerable: false,
        configurable: true
    });
    return ProgressElementContainer;
}(ElementContainer));

var SVGElementContainer = /** @class */ (function (_super) {
    __extends(SVGElementContainer, _super);
    function SVGElementContainer(context, img) {
        var _this = _super.call(this, context, img) || this;
        var bounds = parseBounds(context, img);
        img.setAttribute('width', "".concat(bounds.width, "px"));
        img.setAttribute('height', "".concat(bounds.height, "px"));
        _this.svg = serializeSvg(img);
        _this.intrinsicWidth = img.width.baseVal.value;
        _this.intrinsicHeight = img.height.baseVal.value;
        _this.context.cache.addImage(_this.svg);
        return _this;
    }
    return SVGElementContainer;
}(ElementContainer));

var TextBounds = /** @class */ (function () {
    function TextBounds(text, bounds) {
        this.text = text;
        this.bounds = bounds;
    }
    return TextBounds;
}());
var parseTextBounds = function (context, value, styles, node) {
    var textList = breakText(value, styles);
    var textBounds = [];
    var offset = 0;
    textList.forEach(function (text) {
        if (styles.textDecorationLine.length || text.trim().length > 0) {
            if (FEATURES.SUPPORT_RANGE_BOUNDS) {
                var clientRects = createRange(node, offset, text.length).getClientRects();
                if (clientRects.length > 1) {
                    var subSegments = segmentGraphemes(text);
                    var subOffset_1 = 0;
                    subSegments.forEach(function (subSegment) {
                        textBounds.push(new TextBounds(subSegment, Bounds.fromDOMRectList(context, createRange(node, subOffset_1 + offset, subSegment.length).getClientRects())));
                        subOffset_1 += subSegment.length;
                    });
                }
                else {
                    textBounds.push(new TextBounds(text, Bounds.fromDOMRectList(context, clientRects)));
                }
            }
            else {
                var replacementNode = node.splitText(text.length);
                textBounds.push(new TextBounds(text, getWrapperBounds(context, node)));
                node = replacementNode;
            }
        }
        else if (!FEATURES.SUPPORT_RANGE_BOUNDS) {
            node = node.splitText(text.length);
        }
        offset += text.length;
    });
    return textBounds;
};
var getWrapperBounds = function (context, node) {
    var ownerDocument = node.ownerDocument;
    if (ownerDocument) {
        var wrapper = ownerDocument.createElement('html2canvaswrapper');
        wrapper.appendChild(node.cloneNode(true));
        var parentNode = node.parentNode;
        if (parentNode) {
            parentNode.replaceChild(wrapper, node);
            var bounds = parseBounds(context, wrapper);
            if (wrapper.firstChild) {
                parentNode.replaceChild(wrapper.firstChild, wrapper);
            }
            return bounds;
        }
    }
    return Bounds.EMPTY;
};
var createRange = function (node, offset, length) {
    var ownerDocument = node.ownerDocument;
    if (!ownerDocument) {
        throw new Error('Node has no owner document');
    }
    if (!_reusableRange || _reusableRange.startContainer.ownerDocument !== ownerDocument) {
        _reusableRange = ownerDocument.createRange();
    }
    _reusableRange.setStart(node, offset);
    _reusableRange.setEnd(node, offset + length);
    return _reusableRange;
};
var _reusableRange = null;
var segmentGraphemes = function (value) {
    if (FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var segmenter = new Intl.Segmenter(void 0, { granularity: 'grapheme' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Array.from(segmenter.segment(value)).map(function (segment) { return segment.segment; });
    }
    return splitGraphemes(value);
};
var segmentWords = function (value, styles) {
    if (FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var segmenter = new Intl.Segmenter(void 0, {
            granularity: 'word',
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Array.from(segmenter.segment(value)).map(function (segment) { return segment.segment; });
    }
    return breakWords(value, styles);
};
var breakText = function (value, styles) {
    return styles.letterSpacing !== 0 ? segmentGraphemes(value) : segmentWords(value, styles);
};
// https://drafts.csswg.org/css-text/#word-separator
var wordSeparators = [0x0020, 0x00a0, 0x1361, 0x10100, 0x10101, 0x1039, 0x1091];
var breakWords = function (str, styles) {
    var breaker = LineBreaker(str, {
        lineBreak: styles.lineBreak,
        wordBreak: styles.overflowWrap === "break-word" /* OVERFLOW_WRAP.BREAK_WORD */ ? 'break-word' : styles.wordBreak,
    });
    var words = [];
    var bk;
    var _loop_1 = function () {
        if (bk.value) {
            var value = bk.value.slice();
            var codePoints = toCodePoints(value);
            var word_1 = '';
            codePoints.forEach(function (codePoint) {
                if (wordSeparators.indexOf(codePoint) === -1) {
                    word_1 += fromCodePoint(codePoint);
                }
                else {
                    if (word_1.length) {
                        words.push(word_1);
                    }
                    words.push(fromCodePoint(codePoint));
                    word_1 = '';
                }
            });
            if (word_1.length) {
                words.push(word_1);
            }
        }
    };
    while (!(bk = breaker.next()).done) {
        _loop_1();
    }
    return words;
};

var TextContainer = /** @class */ (function () {
    function TextContainer(context, node, styles) {
        this.text = transform(node.data, styles.textTransform);
        if (styles.textTransform === 6 /* TEXT_TRANSFORM.MATH_AUTO */) {
            // parseTextBounds uses Range offsets on the original DOM text node.
            // math-auto produces surrogate-pair codepoints (U+1D400+, length=2 in JS)
            // from single ASCII chars (length=1), so offsets into the original node
            // would be wrong if we pass the transformed text directly.
            // Parse bounds using the original text, then replace each segment's
            // text with its transformed equivalent and recalculate the width.
            var originalBounds = parseTextBounds(context, node.data, styles, node);
            this.textBounds = remeasureMathAutoBounds(originalBounds, styles);
        }
        else {
            this.textBounds = parseTextBounds(context, this.text, styles, node);
        }
    }
    return TextContainer;
}());
var transform = function (text, transform) {
    switch (transform) {
        case 1 /* TEXT_TRANSFORM.LOWERCASE */:
            return text.toLowerCase();
        case 3 /* TEXT_TRANSFORM.CAPITALIZE */:
            return text.replace(CAPITALIZE, capitalize);
        case 2 /* TEXT_TRANSFORM.UPPERCASE */:
            return text.toUpperCase();
        case 4 /* TEXT_TRANSFORM.FULL_WIDTH */:
            return toFullWidth(text);
        case 5 /* TEXT_TRANSFORM.FULL_SIZE_KANA */:
            return toFullSizeKana(text);
        case 6 /* TEXT_TRANSFORM.MATH_AUTO */:
            return toMathAuto(text);
        case 0 /* TEXT_TRANSFORM.NONE */:
        default:
            return text;
    }
};
var CAPITALIZE = /(^|\s|:|-|\(|\))([a-z])/g;
var capitalize = function (m, p1, p2) {
    if (m.length > 0) {
        return p1 + p2.toUpperCase();
    }
    return m;
};
// Converts standard ASCII characters to full-width characters
var toFullWidth = function (text) {
    return text
        .replace(/[\u0021-\u007E]/g, function (char) { return String.fromCharCode(char.charCodeAt(0) + 0xfee0); })
        .replace(/\u0020/g, '\u3000');
};
// Map of small Kana to normal full-size Kana
var SMALL_KANA_MAP = {
    ぁ: 'あ',
    ぃ: 'い',
    ぅ: 'う',
    ぇ: 'え',
    ぉ: 'お',
    っ: 'つ',
    ゃ: 'や',
    ゅ: 'ゆ',
    ょ: 'よ',
    ゎ: 'わ',
    ゕ: 'か',
    ゖ: 'け', // Small Hiragana ka/ke
    ァ: 'ア',
    ィ: 'イ',
    ゥ: 'ウ',
    ェ: 'エ',
    ォ: 'オ',
    ッ: 'ツ',
    ャ: 'ヤ',
    ュ: 'ユ',
    ョ: 'ヨ',
    ヮ: 'ワ',
    ヵ: 'カ',
    ヶ: 'ケ', // Small Katakana ka/ke
};
// Converts small kana characters to their full-size equivalents
var toFullSizeKana = function (text) {
    return text.replace(/[ぁ-ゎゕゖァ-ヮヵヶ]/g, function (match) { return SMALL_KANA_MAP[match] || match; });
};
// Applies math-auto transformation (typically used for single-character MathML variables)
var toMathAuto = function (text) {
    var trimmed = text.trim();
    // math-auto only converts a single character to its mathematical italic equivalent.
    if (trimmed.length === 1) {
        var code = trimmed.charCodeAt(0);
        // A-Z → Mathematical Italic Capital (U+1D434..U+1D44D)
        if (code >= 65 && code <= 90) {
            return String.fromCodePoint(code + 0x1d3bf);
        }
        // a-z → Mathematical Italic Small (U+1D44E..U+1D467)
        // Exception: 'h' → U+210E (Planck constant)
        if (code >= 97 && code <= 122) {
            if (trimmed === 'h')
                return '\u210E';
            return String.fromCodePoint(code + 0x1d3b9);
        }
    }
    return text;
};
// Canvas used for measuring math-auto glyph widths (shared, lazy-created).
var _mathMeasureCanvas = null;
var _mathMeasureCtx = null;
var getMathMeasureCtx = function () {
    if (!_mathMeasureCtx) {
        _mathMeasureCanvas = document.createElement('canvas');
        _mathMeasureCtx = _mathMeasureCanvas.getContext('2d');
    }
    return _mathMeasureCtx;
};
/**
 * Takes bounds measured on the original ASCII text, transforms each segment's
 * text via toMathAuto(), and recalculates its width using canvas measureText().
 *
 * Returns a new TextBounds[] with transformed text and corrected widths.
 * top, left, height remain from the DOM measurement.
 */
var remeasureMathAutoBounds = function (originalBounds, styles) {
    var ctx = getMathMeasureCtx();
    var fontVariant = styles.fontVariant.filter(function (v) { return v === 'normal' || v === 'small-caps'; }).join('');
    var fontFamily = styles.fontFamily.join(', ');
    var fontSize = isDimensionToken(styles.fontSize)
        ? "".concat(getNumber(styles.fontSize)).concat(styles.fontSize.unit)
        : "".concat(getNumber(styles.fontSize), "px");
    if (ctx) {
        ctx.font = [styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' ');
    }
    return originalBounds.map(function (tb) {
        var transformedText = toMathAuto(tb.text);
        var width = ctx ? ctx.measureText(transformedText).width : tb.bounds.width;
        return new TextBounds(transformedText, new Bounds(tb.bounds.left, tb.bounds.top, width, tb.bounds.height));
    });
};

var LIST_OWNERS = ['OL', 'UL', 'MENU'];
var parseNodeTree = function (context, node, parent, root) {
    var _a;
    for (var childNode = node.firstChild, nextNode = void 0; childNode; childNode = nextNode) {
        nextNode = childNode.nextSibling;
        // Fixes #2238 #1624 - Fix the issue of TextNode content being overlooked in rendering due to being perceived as blank by trim().
        if (isTextNode(childNode) && childNode.data.length > 0) {
            // The U tag marks text with a special underline treatment, and it's not possible to get the underline style from the browser's computed style.
            var parentStep = 3;
            var hasUnderline = void 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var pNode = childNode;
            for (var i = 0; i < parentStep; i++) {
                if (!pNode) {
                    break;
                }
                if (((_a = pNode.parentElement) === null || _a === void 0 ? void 0 : _a.tagName) === 'U') {
                    hasUnderline = true;
                    break;
                }
                pNode = pNode.parentElement;
            }
            var line = parent.styles.textDecorationLine;
            if (hasUnderline && line) {
                for (var j = 0; j < line.length; j++) {
                    line[j] = 1;
                }
            }
            parent.textNodes.push(new TextContainer(context, childNode, parent.styles));
        }
        else if (isElementNode(childNode)) {
            if (isSlotElement(childNode) && childNode.assignedNodes) {
                childNode.assignedNodes().forEach(function (childNode) { return parseNodeTree(context, childNode, parent, root); });
            }
            else {
                var container = createContainer(context, childNode);
                if (container.styles.isVisible()) {
                    if (createsRealStackingContext(childNode, container, root)) {
                        container.flags |= 4 /* FLAGS.CREATES_REAL_STACKING_CONTEXT */;
                    }
                    else if (createsStackingContext(container.styles)) {
                        container.flags |= 2 /* FLAGS.CREATES_STACKING_CONTEXT */;
                    }
                    if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
                        container.flags |= 8 /* FLAGS.IS_LIST_OWNER */;
                    }
                    parent.elements.push(container);
                    if (childNode.shadowRoot) {
                        parseNodeTree(context, childNode.shadowRoot, container, root);
                    }
                    else if (!isTextareaElement(childNode) &&
                        !isSVGElement(childNode) &&
                        !isSelectElement(childNode)) {
                        parseNodeTree(context, childNode, container, root);
                    }
                }
            }
        }
    }
};
var createContainer = function (context, element) {
    if (isImageElement(element)) {
        return new ImageElementContainer(context, element);
    }
    if (isCanvasElement(element)) {
        return new CanvasElementContainer(context, element);
    }
    if (isSVGElement(element)) {
        return new SVGElementContainer(context, element);
    }
    if (isLIElement(element)) {
        return new LIElementContainer(context, element);
    }
    if (isOLElement(element)) {
        return new OLElementContainer(context, element);
    }
    if (isInputElement(element)) {
        return new InputElementContainer(context, element);
    }
    if (isSelectElement(element)) {
        return new SelectElementContainer(context, element);
    }
    if (isTextareaElement(element)) {
        return new TextareaElementContainer(context, element);
    }
    if (isIFrameElement(element)) {
        return new IFrameElementContainer(context, element);
    }
    if (isProgressElement(element)) {
        return new ProgressElementContainer(context, element);
    }
    if (isMeterElement(element)) {
        return new MeterElementContainer(context, element);
    }
    return new ElementContainer(context, element);
};
var parseTree = function (context, element) {
    var container = createContainer(context, element);
    container.flags |= 4 /* FLAGS.CREATES_REAL_STACKING_CONTEXT */;
    parseNodeTree(context, element, container, container);
    return container;
};
var createsRealStackingContext = function (node, container, root) {
    return (container.styles.isPositionedWithZIndex() ||
        container.styles.opacity < 1 ||
        container.styles.isTransformed() ||
        container.styles.isFiltered() ||
        container.styles.mixBlendMode !== 0 /* MIX_BLEND_MODE.NORMAL */ ||
        (isBodyElement(node) && root.styles.isTransparent()));
};
var createsStackingContext = function (styles) { return styles.isPositioned() || styles.isFloating(); };
var isTextNode = function (node) { return node.nodeType === Node.TEXT_NODE; };
var isElementNode = function (node) { return node.nodeType === Node.ELEMENT_NODE; };
var isHTMLElementNode = function (node) {
    return isElementNode(node) && typeof node.style !== 'undefined' && !isSVGElementNode(node);
};
var isSVGElementNode = function (element) {
    return typeof element.className === 'object';
};
var isLIElement = function (node) { return node.tagName === 'LI'; };
var isOLElement = function (node) { return node.tagName === 'OL'; };
var isInputElement = function (node) { return node.tagName === 'INPUT'; };
var isHTMLElement = function (node) { return node.tagName === 'HTML'; };
var isSVGElement = function (node) { return node.tagName === 'svg'; };
var isSVGForeignObjectElement = function (node) { return node.tagName === 'foreignObject'; };
var isBodyElement = function (node) { return node.tagName === 'BODY'; };
var isCanvasElement = function (node) { return node.tagName === 'CANVAS'; };
var isVideoElement = function (node) { return node.tagName === 'VIDEO'; };
var isImageElement = function (node) { return node.tagName === 'IMG'; };
var isIFrameElement = function (node) { return node.tagName === 'IFRAME'; };
var isStyleElement = function (node) { return node.tagName === 'STYLE'; };
var isScriptElement = function (node) { return node.tagName === 'SCRIPT'; };
var isTextareaElement = function (node) { return node.tagName === 'TEXTAREA'; };
var isSelectElement = function (node) { return node.tagName === 'SELECT'; };
var isSlotElement = function (node) { return node.tagName === 'SLOT'; };
var isProgressElement = function (node) { return node.tagName === 'PROGRESS'; };
var isMeterElement = function (node) { return node.tagName === 'METER'; };
// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
var isCustomElement = function (node) { return node.tagName.indexOf('-') > 0; };

var testRangeBounds = function (document) {
    var TEST_HEIGHT = 123;
    if (document.createRange) {
        var range = document.createRange();
        if (range.getBoundingClientRect) {
            var testElement = document.createElement('boundtest');
            testElement.style.height = "".concat(TEST_HEIGHT, "px");
            testElement.style.display = 'block';
            document.body.appendChild(testElement);
            range.selectNode(testElement);
            var rangeBounds = range.getBoundingClientRect();
            var rangeHeight = Math.round(rangeBounds.height);
            document.body.removeChild(testElement);
            if (rangeHeight === TEST_HEIGHT) {
                return true;
            }
        }
    }
    return false;
};
var testIOSLineBreak = function (document) {
    var testElement = document.createElement('boundtest');
    testElement.style.width = '50px';
    testElement.style.display = 'block';
    testElement.style.fontSize = '12px';
    testElement.style.letterSpacing = '0px';
    testElement.style.wordSpacing = '0px';
    document.body.appendChild(testElement);
    var range = document.createRange();
    testElement.innerHTML = typeof ''.repeat === 'function' ? '&#128104;'.repeat(10) : '';
    var node = testElement.firstChild;
    var textList = toCodePoints(node.data).map(function (i) { return fromCodePoint(i); });
    var offset = 0;
    var prev = {};
    // ios 13 does not handle range getBoundingClientRect line changes correctly #2177
    var supports = textList.every(function (text, i) {
        range.setStart(node, offset);
        range.setEnd(node, offset + text.length);
        var rect = range.getBoundingClientRect();
        offset += text.length;
        var boundAhead = rect.x > prev.x || rect.y > prev.y;
        prev = rect;
        if (i === 0) {
            return true;
        }
        return boundAhead;
    });
    document.body.removeChild(testElement);
    return supports;
};
var testCORS = function () { return typeof new Image().crossOrigin !== 'undefined'; };
var testResponseType = function () { return typeof new XMLHttpRequest().responseType === 'string'; };
var testSVG = function (document) {
    var img = new Image();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) {
        return false;
    }
    img.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
    try {
        ctx.drawImage(img, 0, 0);
        canvas.toDataURL();
    }
    catch (e) {
        return false;
    }
    return true;
};
var isGreenPixel = function (data) {
    return data[0] === 0 && data[1] === 255 && data[2] === 0 && data[3] === 255;
};
var testForeignObject = function (document) {
    var canvas = document.createElement('canvas');
    var size = 100;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    if (!ctx) {
        return Promise.reject(false);
    }
    ctx.fillStyle = 'rgb(0, 255, 0)';
    ctx.fillRect(0, 0, size, size);
    var img = new Image();
    var greenImageSrc = canvas.toDataURL();
    img.src = greenImageSrc;
    var svg = createForeignObjectSVG(size, size, 0, 0, img);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, size, size);
    return loadSerializedSVG(svg)
        .then(function (img) {
        ctx.drawImage(img, 0, 0);
        var data = ctx.getImageData(0, 0, size, size).data;
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, size, size);
        var node = document.createElement('div');
        node.style.backgroundImage = "url(".concat(greenImageSrc, ")");
        node.style.height = "".concat(size, "px");
        // Firefox 55 does not render inline <img /> tags
        return isGreenPixel(data)
            ? loadSerializedSVG(createForeignObjectSVG(size, size, 0, 0, node))
            : Promise.reject(false);
    })
        .then(function (img) {
        ctx.drawImage(img, 0, 0);
        // Edge does not render background-images
        return isGreenPixel(ctx.getImageData(0, 0, size, size).data);
    })
        .catch(function () { return false; });
};
var createForeignObjectSVG = function (width, height, x, y, node) {
    var xmlns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(xmlns, 'svg');
    var foreignObject = document.createElementNS(xmlns, 'foreignObject');
    svg.setAttributeNS(null, 'width', width.toString());
    svg.setAttributeNS(null, 'height', height.toString());
    foreignObject.setAttributeNS(null, 'width', '100%');
    foreignObject.setAttributeNS(null, 'height', '100%');
    foreignObject.setAttributeNS(null, 'x', x.toString());
    foreignObject.setAttributeNS(null, 'y', y.toString());
    foreignObject.setAttributeNS(null, 'externalResourcesRequired', 'true');
    svg.appendChild(foreignObject);
    foreignObject.appendChild(node);
    return svg;
};
var serializeSvg = function (svg, encoding) {
    if (encoding === void 0) { encoding = ''; }
    var svgPrefix = 'data:image/svg+xml';
    var selializedSvg = new XMLSerializer().serializeToString(svg);
    var encodedSvg = encoding === 'base64' ? btoa(selializedSvg) : encodeURIComponent(selializedSvg);
    return "".concat(svgPrefix).concat(encoding && ";".concat(encoding), ",").concat(encodedSvg);
};
var INLINE_BASE64$1 = /^data:image\/.*;base64,/i;
var deserializeSvg = function (svg) {
    var _a = svg.split(','), inlinedSvg = _a[1];
    var encodedSvg = INLINE_BASE64$1.test(svg) ? atob(inlinedSvg) : decodeURIComponent(inlinedSvg);
    var domParser = new DOMParser();
    var document = domParser.parseFromString(encodedSvg, 'image/svg+xml');
    var parserError = document.querySelector('parsererror');
    if (parserError) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Expected 0-1 arguments, but got 2.
        throw new Error('Deserialisation failed', { cause: parserError });
    }
    var documentElement = document.documentElement;
    var firstSvgChild = documentElement.firstElementChild;
    return firstSvgChild && isSVGForeignObjectElement(firstSvgChild)
        ? documentElement
        : documentElement;
};
var loadSerializedSVG = function (svg) {
    return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () { return resolve(img); };
        img.onerror = reject;
        img.src = serializeSvg(svg, 'charset=utf-8');
    });
};
var FEATURES = {
    get SUPPORT_RANGE_BOUNDS() {
        var value = testRangeBounds(document);
        Object.defineProperty(FEATURES, 'SUPPORT_RANGE_BOUNDS', { value: value });
        return value;
    },
    get SUPPORT_WORD_BREAKING() {
        var value = FEATURES.SUPPORT_RANGE_BOUNDS && testIOSLineBreak(document);
        Object.defineProperty(FEATURES, 'SUPPORT_WORD_BREAKING', { value: value });
        return value;
    },
    get SUPPORT_SVG_DRAWING() {
        var value = testSVG(document);
        Object.defineProperty(FEATURES, 'SUPPORT_SVG_DRAWING', { value: value });
        return value;
    },
    get SUPPORT_FOREIGNOBJECT_DRAWING() {
        var value = typeof Array.from === 'function' && typeof window.fetch === 'function'
            ? testForeignObject(document)
            : Promise.resolve(false);
        Object.defineProperty(FEATURES, 'SUPPORT_FOREIGNOBJECT_DRAWING', { value: value });
        return value;
    },
    get SUPPORT_CORS_IMAGES() {
        var value = testCORS();
        Object.defineProperty(FEATURES, 'SUPPORT_CORS_IMAGES', { value: value });
        return value;
    },
    get SUPPORT_RESPONSE_TYPE() {
        var value = testResponseType();
        Object.defineProperty(FEATURES, 'SUPPORT_RESPONSE_TYPE', { value: value });
        return value;
    },
    get SUPPORT_CORS_XHR() {
        var value = 'withCredentials' in new XMLHttpRequest();
        Object.defineProperty(FEATURES, 'SUPPORT_CORS_XHR', { value: value });
        return value;
    },
    get SUPPORT_NATIVE_TEXT_SEGMENTATION() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var value = !!(typeof Intl !== 'undefined' && Intl.Segmenter);
        Object.defineProperty(FEATURES, 'SUPPORT_NATIVE_TEXT_SEGMENTATION', { value: value });
        return value;
    },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
var cache = {};
var CacheStorage = /** @class */ (function () {
    function CacheStorage() {
    }
    CacheStorage.getOrigin = function (url) {
        var link = CacheStorage._link;
        if (!link) {
            return 'about:blank';
        }
        link.href = url;
        link.href = link.href; // IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/
        return link.protocol + link.hostname + link.port;
    };
    CacheStorage.isSameOrigin = function (src) {
        return CacheStorage.getOrigin(src) === CacheStorage._origin;
    };
    CacheStorage.setContext = function (window) {
        CacheStorage._link = window.document.createElement('a');
        CacheStorage._origin = CacheStorage.getOrigin(window.location.href);
    };
    CacheStorage._origin = 'about:blank';
    return CacheStorage;
}());
var Cache = /** @class */ (function () {
    function Cache(context, _options) {
        this.context = context;
        this._options = _options;
    }
    Cache.prototype.deleteImage = function (src) {
        if (this.has(src)) {
            delete cache[src];
            return true;
        }
        return false;
    };
    Cache.prototype.addImage = function (src) {
        if (this.has(src))
            return true;
        if (isBlobImage(src) || isRenderable(src)) {
            (cache[src] = this.loadImage(src)).catch(function () {
                // prevent unhandled rejection
            });
            return true;
        }
        return false;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cache.prototype.match = function (src) {
        return cache[src];
    };
    Cache.prototype.loadImage = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var isExtensionImage, isSameOrigin, useCORS, useProxy, src;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isExtensionImage = key.startsWith('chrome-extension://');
                        isSameOrigin = CacheStorage.isSameOrigin(key) || isExtensionImage;
                        useCORS = !isInlineImage(key) && this._options.useCORS === true && FEATURES.SUPPORT_CORS_IMAGES && !isSameOrigin;
                        useProxy = !isInlineImage(key) &&
                            !isSameOrigin &&
                            !isBlobImage(key) &&
                            typeof this._options.proxy === 'string' &&
                            FEATURES.SUPPORT_CORS_XHR &&
                            !useCORS &&
                            !isExtensionImage;
                        if (!isSameOrigin &&
                            this._options.allowTaint === false &&
                            !isInlineImage(key) &&
                            !isBlobImage(key) &&
                            !useProxy &&
                            !useCORS) {
                            return [2 /*return*/];
                        }
                        src = key;
                        if (!useProxy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.proxy(src)];
                    case 1:
                        src = _a.sent();
                        _a.label = 2;
                    case 2:
                        this.context.logger.debug("Added image ".concat(key.substring(0, 256)));
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var img = new Image();
                                img.onload = function () { return resolve(img); };
                                img.onerror = reject;
                                //ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous
                                if (isInlineImage(src) || isInlineBase64Image(src) || useCORS) {
                                    img.crossOrigin = 'anonymous';
                                }
                                if (!isInlineImage(src) && useCORS) {
                                    // in chrome if the image loaded before without crossorigin it will be cached and used later even if the next usage has crossorigin
                                    // it will fail with CORS error, add a random query parameter just to prevent the chrome from using the cached image
                                    // see more info about the chrome issue in this link: https://stackoverflow.com/a/49503414
                                    src = src + (src.includes('?') ? '&' : '?') + "cors=".concat(Math.random());
                                }
                                img.src = src;
                                if (img.complete === true) {
                                    // Inline XML images may fail to parse, throwing an Error later on
                                    setTimeout(function () { return resolve(img); }, 500);
                                }
                                if (_this._options.imageTimeout > 0) {
                                    setTimeout(function () { return reject("Timed out (".concat(_this._options.imageTimeout, "ms) loading image")); }, _this._options.imageTimeout);
                                }
                            })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Cache.prototype.has = function (key) {
        return key in cache;
    };
    Cache.prototype.keys = function () {
        return Promise.resolve(Object.keys(cache));
    };
    Cache.prototype.proxy = function (src) {
        var _this = this;
        var proxy = this._options.proxy;
        if (!proxy) {
            throw new Error('No proxy defined');
        }
        var key = src.substring(0, 256);
        return new Promise(function (resolve, reject) {
            var responseType = FEATURES.SUPPORT_RESPONSE_TYPE ? 'blob' : 'text';
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status === 200) {
                    if (responseType === 'text') {
                        resolve(xhr.response);
                    }
                    else {
                        var reader_1 = new FileReader();
                        reader_1.addEventListener('load', function () { return resolve(reader_1.result); }, false);
                        reader_1.addEventListener('error', function (e) { return reject(e); }, false);
                        reader_1.readAsDataURL(xhr.response);
                    }
                }
                else {
                    reject("Failed to proxy resource ".concat(key, " with status code ").concat(xhr.status));
                }
            };
            xhr.onerror = reject;
            var queryString = proxy.includes('?') ? '&' : '?';
            xhr.open('GET', "".concat(proxy).concat(queryString, "url=").concat(encodeURIComponent(src), "&responseType=").concat(responseType));
            if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {
                xhr.responseType = responseType;
            }
            if (_this._options.imageTimeout) {
                var timeout_1 = _this._options.imageTimeout;
                xhr.timeout = timeout_1;
                xhr.ontimeout = function () { return reject("Timed out (".concat(timeout_1, "ms) proxying ").concat(key)); };
            }
            xhr.send();
        });
    };
    return Cache;
}());
var INLINE_SVG = /^data:image\/svg\+xml/i;
var INLINE_BASE64 = /^data:image\/.*;base64,/i;
var INLINE_IMG = /^data:image\/.*/i;
var isRenderable = function (src) { return FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src); };
var isInlineImage = function (src) { return INLINE_IMG.test(src); };
var isInlineBase64Image = function (src) { return INLINE_BASE64.test(src); };
var isBlobImage = function (src) { return src.slice(0, 4) === 'blob'; };
var isSVG = function (src) { return src.slice(-3).toLowerCase() === 'svg' || INLINE_SVG.test(src); };

var Logger = /** @class */ (function () {
    function Logger(_a) {
        var id = _a.id, enabled = _a.enabled;
        this.id = id;
        this.enabled = enabled;
        this.start = Date.now();
    }
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.enabled) {
            if (typeof window !== 'undefined' && window.console && typeof console.debug === 'function') {
                console.debug.apply(console, __spreadArray([this.id, "".concat(this.getTime(), "ms")], args, false));
            }
            else {
                this.info.apply(this, args);
            }
        }
    };
    Logger.prototype.getTime = function () {
        return Date.now() - this.start;
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.enabled) {
            if (typeof window !== 'undefined' && window.console && typeof console.info === 'function') {
                console.info.apply(console, __spreadArray([this.id, "".concat(this.getTime(), "ms")], args, false));
            }
        }
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.enabled) {
            if (typeof window !== 'undefined' && window.console && typeof console.warn === 'function') {
                console.warn.apply(console, __spreadArray([this.id, "".concat(this.getTime(), "ms")], args, false));
            }
            else {
                this.info.apply(this, args);
            }
        }
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.enabled) {
            if (typeof window !== 'undefined' && window.console && typeof console.error === 'function') {
                console.error.apply(console, __spreadArray([this.id, "".concat(this.getTime(), "ms")], args, false));
            }
            else {
                this.info.apply(this, args);
            }
        }
    };
    Logger.instances = {};
    return Logger;
}());

var Context = /** @class */ (function () {
    function Context(options, windowBounds) {
        var _a;
        this.windowBounds = windowBounds;
        this.instanceName = "#".concat(Context.instanceCount++);
        this.logger = new Logger({ id: this.instanceName, enabled: options.logging });
        this.cache = (_a = options.cache) !== null && _a !== void 0 ? _a : new Cache(this, options);
    }
    Context.instanceCount = 1;
    return Context;
}());

var CounterState = /** @class */ (function () {
    function CounterState() {
        this.counters = {};
    }
    CounterState.prototype.getCounterValue = function (name) {
        var counter = this.counters[name];
        if (counter && counter.length) {
            return counter[counter.length - 1];
        }
        return 1;
    };
    CounterState.prototype.getCounterValues = function (name) {
        var counter = this.counters[name];
        return counter ? counter : [];
    };
    CounterState.prototype.pop = function (counters) {
        var _this = this;
        counters.forEach(function (counter) { return _this.counters[counter].pop(); });
    };
    CounterState.prototype.parse = function (style) {
        var _this = this;
        var counterIncrement = style.counterIncrement;
        var counterReset = style.counterReset;
        var canReset = true;
        if (counterIncrement !== null) {
            counterIncrement.forEach(function (entry) {
                var counter = _this.counters[entry.counter];
                if (counter && entry.increment !== 0) {
                    canReset = false;
                    if (!counter.length) {
                        counter.push(1);
                    }
                    counter[Math.max(0, counter.length - 1)] += entry.increment;
                }
            });
        }
        var counterNames = [];
        if (canReset) {
            counterReset.forEach(function (entry) {
                var counter = _this.counters[entry.counter];
                counterNames.push(entry.counter);
                if (!counter) {
                    counter = _this.counters[entry.counter] = [];
                }
                counter.push(entry.reset);
            });
        }
        return counterNames;
    };
    return CounterState;
}());
var ROMAN_UPPER = {
    integers: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
    values: ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'],
};
var ARMENIAN = {
    integers: [
        9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 90, 80, 70,
        60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
    ],
    values: [
        'Ք',
        'Փ',
        'Ւ',
        'Ց',
        'Ր',
        'Տ',
        'Վ',
        'Ս',
        'Ռ',
        'Ջ',
        'Պ',
        'Չ',
        'Ո',
        'Շ',
        'Ն',
        'Յ',
        'Մ',
        'Ճ',
        'Ղ',
        'Ձ',
        'Հ',
        'Կ',
        'Ծ',
        'Խ',
        'Լ',
        'Ի',
        'Ժ',
        'Թ',
        'Ը',
        'Է',
        'Զ',
        'Ե',
        'Դ',
        'Գ',
        'Բ',
        'Ա',
    ],
};
var HEBREW = {
    integers: [
        10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20,
        19, 18, 17, 16, 15, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
    ],
    values: [
        'י׳',
        'ט׳',
        'ח׳',
        'ז׳',
        'ו׳',
        'ה׳',
        'ד׳',
        'ג׳',
        'ב׳',
        'א׳',
        'ת',
        'ש',
        'ר',
        'ק',
        'צ',
        'פ',
        'ע',
        'ס',
        'נ',
        'מ',
        'ל',
        'כ',
        'יט',
        'יח',
        'יז',
        'טז',
        'טו',
        'י',
        'ט',
        'ח',
        'ז',
        'ו',
        'ה',
        'ד',
        'ג',
        'ב',
        'א',
    ],
};
var GEORGIAN = {
    integers: [
        10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 90,
        80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
    ],
    values: [
        'ჵ',
        'ჰ',
        'ჯ',
        'ჴ',
        'ხ',
        'ჭ',
        'წ',
        'ძ',
        'ც',
        'ჩ',
        'შ',
        'ყ',
        'ღ',
        'ქ',
        'ფ',
        'ჳ',
        'ტ',
        'ს',
        'რ',
        'ჟ',
        'პ',
        'ო',
        'ჲ',
        'ნ',
        'მ',
        'ლ',
        'კ',
        'ი',
        'თ',
        'ჱ',
        'ზ',
        'ვ',
        'ე',
        'დ',
        'გ',
        'ბ',
        'ა',
    ],
};
var createAdditiveCounter = function (value, min, max, symbols, fallback, suffix) {
    if (value < min || value > max) {
        return createCounterText(value, fallback, suffix.length > 0);
    }
    return (symbols.integers.reduce(function (string, integer, index) {
        while (value >= integer) {
            value -= integer;
            string += symbols.values[index];
        }
        return string;
    }, '') + suffix);
};
var createCounterStyleWithSymbolResolver = function (value, codePointRangeLength, isNumeric, resolver) {
    var string = '';
    do {
        if (!isNumeric) {
            value--;
        }
        string = resolver(value) + string;
        value /= codePointRangeLength;
    } while (value * codePointRangeLength >= codePointRangeLength);
    return string;
};
var createCounterStyleFromRange = function (value, codePointRangeStart, codePointRangeEnd, isNumeric, suffix) {
    var codePointRangeLength = codePointRangeEnd - codePointRangeStart + 1;
    return ((value < 0 ? '-' : '') +
        (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, isNumeric, function (codePoint) {
            return fromCodePoint(Math.floor(codePoint % codePointRangeLength) + codePointRangeStart);
        }) +
            suffix));
};
var createCounterStyleFromSymbols = function (value, symbols, suffix) {
    if (suffix === void 0) { suffix = '. '; }
    var codePointRangeLength = symbols.length;
    return (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, false, function (codePoint) { return symbols[Math.floor(codePoint % codePointRangeLength)]; }) + suffix);
};
var CJK_ZEROS = 1 << 0;
var CJK_TEN_COEFFICIENTS = 1 << 1;
var CJK_TEN_HIGH_COEFFICIENTS = 1 << 2;
var CJK_HUNDRED_COEFFICIENTS = 1 << 3;
var createCJKCounter = function (value, numbers, multipliers, negativeSign, suffix, flags) {
    if (value < -9999 || value > 9999) {
        return createCounterText(value, 4 /* LIST_STYLE_TYPE.CJK_DECIMAL */, suffix.length > 0);
    }
    var tmp = Math.abs(value);
    var string = suffix;
    if (tmp === 0) {
        return numbers[0] + string;
    }
    for (var digit = 0; tmp > 0 && digit <= 4; digit++) {
        var coefficient = tmp % 10;
        if (coefficient === 0 && contains(flags, CJK_ZEROS) && string !== '') {
            string = numbers[coefficient] + string;
        }
        else if (coefficient > 1 ||
            (coefficient === 1 && digit === 0) ||
            (coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_COEFFICIENTS)) ||
            (coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_HIGH_COEFFICIENTS) && value > 100) ||
            (coefficient === 1 && digit > 1 && contains(flags, CJK_HUNDRED_COEFFICIENTS))) {
            string = numbers[coefficient] + (digit > 0 ? multipliers[digit - 1] : '') + string;
        }
        else if (coefficient === 1 && digit > 0) {
            string = multipliers[digit - 1] + string;
        }
        tmp = Math.floor(tmp / 10);
    }
    return (value < 0 ? negativeSign : '') + string;
};
var CHINESE_INFORMAL_MULTIPLIERS = '十百千萬';
var CHINESE_FORMAL_MULTIPLIERS = '拾佰仟萬';
var JAPANESE_NEGATIVE = 'マイナス';
var KOREAN_NEGATIVE = '마이너스';
var createCounterText = function (value, type, appendSuffix) {
    var defaultSuffix = appendSuffix ? '. ' : '';
    var cjkSuffix = appendSuffix ? '、' : '';
    var koreanSuffix = appendSuffix ? ', ' : '';
    var spaceSuffix = appendSuffix ? ' ' : '';
    switch (type) {
        case 0 /* LIST_STYLE_TYPE.DISC */:
            return '•' + spaceSuffix;
        case 1 /* LIST_STYLE_TYPE.CIRCLE */:
            return '◦' + spaceSuffix;
        case 2 /* LIST_STYLE_TYPE.SQUARE */:
            return '◾' + spaceSuffix;
        case 5 /* LIST_STYLE_TYPE.DECIMAL_LEADING_ZERO */:
            var string = createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
            return string.length < 4 ? "0".concat(string) : string;
        case 4 /* LIST_STYLE_TYPE.CJK_DECIMAL */:
            return createCounterStyleFromSymbols(value, '〇一二三四五六七八九', cjkSuffix);
        case 6 /* LIST_STYLE_TYPE.LOWER_ROMAN */:
            return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, 3 /* LIST_STYLE_TYPE.DECIMAL */, defaultSuffix).toLowerCase();
        case 7 /* LIST_STYLE_TYPE.UPPER_ROMAN */:
            return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, 3 /* LIST_STYLE_TYPE.DECIMAL */, defaultSuffix);
        case 8 /* LIST_STYLE_TYPE.LOWER_GREEK */:
            return createCounterStyleFromRange(value, 945, 969, false, defaultSuffix);
        case 9 /* LIST_STYLE_TYPE.LOWER_ALPHA */:
            return createCounterStyleFromRange(value, 97, 122, false, defaultSuffix);
        case 10 /* LIST_STYLE_TYPE.UPPER_ALPHA */:
            return createCounterStyleFromRange(value, 65, 90, false, defaultSuffix);
        case 11 /* LIST_STYLE_TYPE.ARABIC_INDIC */:
            return createCounterStyleFromRange(value, 1632, 1641, true, defaultSuffix);
        case 12 /* LIST_STYLE_TYPE.ARMENIAN */:
        case 50 /* LIST_STYLE_TYPE.UPPER_ARMENIAN */:
            return createAdditiveCounter(value, 1, 9999, ARMENIAN, 3 /* LIST_STYLE_TYPE.DECIMAL */, defaultSuffix);
        case 36 /* LIST_STYLE_TYPE.LOWER_ARMENIAN */:
            return createAdditiveCounter(value, 1, 9999, ARMENIAN, 3 /* LIST_STYLE_TYPE.DECIMAL */, defaultSuffix).toLowerCase();
        case 13 /* LIST_STYLE_TYPE.BENGALI */:
            return createCounterStyleFromRange(value, 2534, 2543, true, defaultSuffix);
        case 14 /* LIST_STYLE_TYPE.CAMBODIAN */:
        case 31 /* LIST_STYLE_TYPE.KHMER */:
            return createCounterStyleFromRange(value, 6112, 6121, true, defaultSuffix);
        case 15 /* LIST_STYLE_TYPE.CJK_EARTHLY_BRANCH */:
            return createCounterStyleFromSymbols(value, '子丑寅卯辰巳午未申酉戌亥', cjkSuffix);
        case 16 /* LIST_STYLE_TYPE.CJK_HEAVENLY_STEM */:
            return createCounterStyleFromSymbols(value, '甲乙丙丁戊己庚辛壬癸', cjkSuffix);
        case 17 /* LIST_STYLE_TYPE.CJK_IDEOGRAPHIC */:
        case 49 /* LIST_STYLE_TYPE.TRAD_CHINESE_INFORMAL */:
            return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
        case 48 /* LIST_STYLE_TYPE.TRAD_CHINESE_FORMAL */:
            return createCJKCounter(value, '零壹貳參肆伍陸柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
        case 43 /* LIST_STYLE_TYPE.SIMP_CHINESE_INFORMAL */:
            return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
        case 42 /* LIST_STYLE_TYPE.SIMP_CHINESE_FORMAL */:
            return createCJKCounter(value, '零壹贰叁肆伍陆柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
        case 27 /* LIST_STYLE_TYPE.JAPANESE_INFORMAL */:
            return createCJKCounter(value, '〇一二三四五六七八九', '十百千万', JAPANESE_NEGATIVE, cjkSuffix, 0);
        case 26 /* LIST_STYLE_TYPE.JAPANESE_FORMAL */:
            return createCJKCounter(value, '零壱弐参四伍六七八九', '拾百千万', JAPANESE_NEGATIVE, cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
        case 32 /* LIST_STYLE_TYPE.KOREAN_HANGUL_FORMAL */:
            return createCJKCounter(value, '영일이삼사오육칠팔구', '십백천만', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
        case 34 /* LIST_STYLE_TYPE.KOREAN_HANJA_INFORMAL */:
            return createCJKCounter(value, '零一二三四五六七八九', '十百千萬', KOREAN_NEGATIVE, koreanSuffix, 0);
        case 33 /* LIST_STYLE_TYPE.KOREAN_HANJA_FORMAL */:
            return createCJKCounter(value, '零壹貳參四五六七八九', '拾百千', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
        case 18 /* LIST_STYLE_TYPE.DEVANAGARI */:
            return createCounterStyleFromRange(value, 0x966, 0x96f, true, defaultSuffix);
        case 20 /* LIST_STYLE_TYPE.GEORGIAN */:
            return createAdditiveCounter(value, 1, 19999, GEORGIAN, 3 /* LIST_STYLE_TYPE.DECIMAL */, defaultSuffix);
        case 21 /* LIST_STYLE_TYPE.GUJARATI */:
            return createCounterStyleFromRange(value, 0xae6, 0xaef, true, defaultSuffix);
        case 22 /* LIST_STYLE_TYPE.GURMUKHI */:
            return createCounterStyleFromRange(value, 0xa66, 0xa6f, true, defaultSuffix);
        case 23 /* LIST_STYLE_TYPE.HEBREW */:
            return createAdditiveCounter(value, 1, 10999, HEBREW, 3 /* LIST_STYLE_TYPE.DECIMAL */, defaultSuffix);
        case 24 /* LIST_STYLE_TYPE.HIRAGANA */:
            return createCounterStyleFromSymbols(value, 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん');
        case 25 /* LIST_STYLE_TYPE.HIRAGANA_IROHA */:
            return createCounterStyleFromSymbols(value, 'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす');
        case 28 /* LIST_STYLE_TYPE.KANNADA */:
            return createCounterStyleFromRange(value, 0xce6, 0xcef, true, defaultSuffix);
        case 29 /* LIST_STYLE_TYPE.KATAKANA */:
            return createCounterStyleFromSymbols(value, 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン', cjkSuffix);
        case 30 /* LIST_STYLE_TYPE.KATAKANA_IROHA */:
            return createCounterStyleFromSymbols(value, 'イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス', cjkSuffix);
        case 35 /* LIST_STYLE_TYPE.LAO */:
            return createCounterStyleFromRange(value, 0xed0, 0xed9, true, defaultSuffix);
        case 38 /* LIST_STYLE_TYPE.MONGOLIAN */:
            return createCounterStyleFromRange(value, 0x1810, 0x1819, true, defaultSuffix);
        case 39 /* LIST_STYLE_TYPE.MYANMAR */:
            return createCounterStyleFromRange(value, 0x1040, 0x1049, true, defaultSuffix);
        case 40 /* LIST_STYLE_TYPE.ORIYA */:
            return createCounterStyleFromRange(value, 0xb66, 0xb6f, true, defaultSuffix);
        case 41 /* LIST_STYLE_TYPE.PERSIAN */:
            return createCounterStyleFromRange(value, 0x6f0, 0x6f9, true, defaultSuffix);
        case 44 /* LIST_STYLE_TYPE.TAMIL */:
            return createCounterStyleFromRange(value, 0xbe6, 0xbef, true, defaultSuffix);
        case 45 /* LIST_STYLE_TYPE.TELUGU */:
            return createCounterStyleFromRange(value, 0xc66, 0xc6f, true, defaultSuffix);
        case 46 /* LIST_STYLE_TYPE.THAI */:
            return createCounterStyleFromRange(value, 0xe50, 0xe59, true, defaultSuffix);
        case 47 /* LIST_STYLE_TYPE.TIBETAN */:
            return createCounterStyleFromRange(value, 0xf20, 0xf29, true, defaultSuffix);
        case 3 /* LIST_STYLE_TYPE.DECIMAL */:
        default:
            return createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
    }
};

var IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';
var DocumentCloner = /** @class */ (function () {
    function DocumentCloner(context, element, options) {
        this.context = context;
        this.options = options;
        this.scrolledElements = [];
        this.referenceElement = element;
        this.counters = new CounterState();
        this.quoteDepth = 0;
        if (!element.ownerDocument) {
            throw new Error('Cloned element does not have an owner document');
        }
        this.documentElement = this.cloneNode(element.ownerDocument.documentElement, false);
    }
    DocumentCloner.prototype.toIFrame = function (ownerDocument, windowSize) {
        var _this = this;
        var iframe = createIFrameContainer(ownerDocument, windowSize);
        if (!iframe.contentWindow) {
            return Promise.reject("Unable to find iframe window");
        }
        var scrollX = ownerDocument.defaultView.pageXOffset;
        var scrollY = ownerDocument.defaultView.pageYOffset;
        var cloneWindow = iframe.contentWindow;
        var documentClone = cloneWindow.document;
        /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
         if window url is about:blank, we can assign the url to current by writing onto the document
         */
        var iframeLoad = iframeLoader(iframe).then(function () { return __awaiter(_this, void 0, void 0, function () {
            var onclone, referenceElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.scrolledElements.forEach(restoreNodeScroll);
                        if (cloneWindow) {
                            cloneWindow.scrollTo(windowSize.left, windowSize.top);
                            if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) &&
                                (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)) {
                                this.context.logger.warn('Unable to restore scroll position for cloned document');
                                this.context.windowBounds = this.context.windowBounds.add(cloneWindow.scrollX - windowSize.left, cloneWindow.scrollY - windowSize.top, 0, 0);
                            }
                        }
                        onclone = this.options.onclone;
                        referenceElement = this.clonedReferenceElement;
                        if (typeof referenceElement === 'undefined') {
                            return [2 /*return*/, Promise.reject("Error finding the ".concat(this.referenceElement.nodeName, " in the cloned document"))];
                        }
                        if (!(documentClone.fonts && documentClone.fonts.status === 'loading')) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.race([
                                documentClone.fonts.ready,
                                new Promise(function (resolve) {
                                    var fontLoadTimer = setInterval(function () {
                                        if (documentClone.fonts.status === 'loaded') {
                                            clearInterval(fontLoadTimer);
                                            resolve();
                                        }
                                    }, 1000);
                                }),
                            ])];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!/(AppleWebKit)/g.test(navigator.userAgent)) return [3 /*break*/, 4];
                        return [4 /*yield*/, imagesReady(documentClone)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (typeof onclone === 'function') {
                            return [2 /*return*/, Promise.resolve()
                                    .then(function () { return onclone(documentClone, referenceElement); })
                                    .then(function () { return iframe; })];
                        }
                        return [2 /*return*/, iframe];
                }
            });
        }); });
        var adoptedNode = documentClone.adoptNode(this.documentElement);
        /**
         * The baseURI of the document will be lost after documentClone.open().
         * We can avoid it by adding <base> element.
         * */
        addBase(adoptedNode, documentClone);
        documentClone.open();
        documentClone.write("".concat(serializeDoctype(document.doctype), "<html></html>"));
        // Chrome scrolls the parent document for some reason after the write to the cloned window???
        restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
        documentClone.replaceChild(adoptedNode, documentClone.documentElement);
        documentClone.close();
        return iframeLoad;
    };
    DocumentCloner.prototype.createElementClone = function (node) {
        if (isDebugging(node, 2 /* DebuggerType.CLONE */)) {
            debugger;
        }
        if (isCanvasElement(node)) {
            return this.createCanvasClone(node);
        }
        if (isVideoElement(node)) {
            return this.createVideoClone(node);
        }
        if (isStyleElement(node)) {
            return this.createStyleClone(node);
        }
        var clone = node.cloneNode(false);
        if (isImageElement(clone)) {
            if (isImageElement(node) && node.currentSrc && node.currentSrc !== node.src) {
                clone.src = node.currentSrc;
                clone.srcset = '';
            }
            if (clone.loading === 'lazy') {
                clone.loading = 'eager';
            }
        }
        if (isCustomElement(clone)) {
            return this.createCustomElementClone(clone);
        }
        return clone;
    };
    DocumentCloner.prototype.createCustomElementClone = function (node) {
        var clone = document.createElement('html2canvascustomelement');
        copyCSSStyles(node.style, clone, this.options.onCopyProperty);
        return clone;
    };
    DocumentCloner.prototype.createStyleClone = function (node) {
        try {
            var sheet = node.sheet;
            if (sheet && sheet.cssRules) {
                var rules = sheet.cssRules;
                var parts = [];
                for (var i = 0; i < rules.length; i++) {
                    var rule = rules[i];
                    if (rule && typeof rule.cssText === 'string') {
                        parts.push(rule.cssText);
                    }
                }
                var style = node.cloneNode(false);
                style.textContent = parts.join('');
                return style;
            }
        }
        catch (e) {
            // accessing node.sheet.cssRules throws a DOMException
            this.context.logger.error('Unable to access cssRules property', e);
            if (e.name !== 'SecurityError') {
                throw e;
            }
        }
        return node.cloneNode(false);
    };
    DocumentCloner.prototype.createCanvasClone = function (canvas) {
        var _a;
        if (this.options.inlineImages && canvas.ownerDocument) {
            var img = canvas.ownerDocument.createElement('img');
            try {
                img.src = canvas.toDataURL();
                return img;
            }
            catch (e) {
                this.context.logger.info("Unable to inline canvas contents, canvas is tainted", canvas);
            }
        }
        var clonedCanvas = canvas.cloneNode(false);
        try {
            clonedCanvas.width = canvas.width;
            clonedCanvas.height = canvas.height;
            var ctx = canvas.getContext('2d');
            var clonedCtx = clonedCanvas.getContext('2d', { willReadFrequently: true });
            if (clonedCtx) {
                if (!this.options.allowTaint && ctx) {
                    clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
                }
                else {
                    var gl = (_a = canvas.getContext('webgl2')) !== null && _a !== void 0 ? _a : canvas.getContext('webgl');
                    if (gl) {
                        var attribs = gl.getContextAttributes();
                        if ((attribs === null || attribs === void 0 ? void 0 : attribs.preserveDrawingBuffer) === false) {
                            this.context.logger.warn('Unable to clone WebGL context as it has preserveDrawingBuffer=false', canvas);
                        }
                    }
                    clonedCtx.drawImage(canvas, 0, 0);
                }
            }
            return clonedCanvas;
        }
        catch (e) {
            this.context.logger.info("Unable to clone canvas as it is tainted", canvas);
        }
        return clonedCanvas;
    };
    DocumentCloner.prototype.createVideoClone = function (video) {
        var canvas = video.ownerDocument.createElement('canvas');
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        var ctx = canvas.getContext('2d');
        try {
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                if (!this.options.allowTaint) {
                    ctx.getImageData(0, 0, canvas.width, canvas.height);
                }
            }
            return canvas;
        }
        catch (e) {
            this.context.logger.info("Unable to clone video as it is tainted", video);
        }
        var blankCanvas = video.ownerDocument.createElement('canvas');
        blankCanvas.width = video.offsetWidth;
        blankCanvas.height = video.offsetHeight;
        return blankCanvas;
    };
    DocumentCloner.prototype.appendChildNode = function (clone, child, copyStyles) {
        if (!isElementNode(child) ||
            (!isScriptElement(child) &&
                !child.hasAttribute(IGNORE_ATTRIBUTE) &&
                (typeof this.options.ignoreElements !== 'function' || !this.options.ignoreElements(child)))) {
            if (!this.options.copyStyles || !isElementNode(child) || !isStyleElement(child)) {
                clone.appendChild(this.cloneNode(child, copyStyles));
            }
        }
    };
    DocumentCloner.prototype.cloneChildNodes = function (node, clone, copyStyles) {
        var _this = this;
        for (var child = node.shadowRoot ? node.shadowRoot.firstChild : node.firstChild; child; child = child.nextSibling) {
            if (isElementNode(child) && isSlotElement(child) && typeof child.assignedNodes === 'function') {
                var assignedNodes = child.assignedNodes();
                if (assignedNodes.length) {
                    assignedNodes.forEach(function (assignedNode) { return _this.appendChildNode(clone, assignedNode, copyStyles); });
                }
            }
            else {
                this.appendChildNode(clone, child, copyStyles);
            }
        }
    };
    DocumentCloner.prototype.cloneNode = function (node, copyStyles) {
        if (isTextNode(node)) {
            return document.createTextNode(node.data);
        }
        if (!node.ownerDocument) {
            return node.cloneNode(false);
        }
        var window = node.ownerDocument.defaultView;
        if (window && isElementNode(node) && (isHTMLElementNode(node) || isSVGElementNode(node))) {
            var clone = this.createElementClone(node);
            clone.style.transitionProperty = 'none';
            var style = window.getComputedStyle(node);
            var styleBefore = window.getComputedStyle(node, ':before');
            var styleAfter = window.getComputedStyle(node, ':after');
            if (this.referenceElement === node && isHTMLElementNode(clone)) {
                this.clonedReferenceElement = clone;
            }
            if (isBodyElement(clone)) {
                createPseudoHideStyles(clone);
            }
            var counters = this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
            var before = this.resolvePseudoContent(node, clone, styleBefore, PseudoElementType.BEFORE);
            if (isCustomElement(node)) {
                copyStyles = true;
            }
            if (!isVideoElement(node)) {
                this.cloneChildNodes(node, clone, copyStyles);
            }
            if (before) {
                clone.insertBefore(before, clone.firstChild);
            }
            var after = this.resolvePseudoContent(node, clone, styleAfter, PseudoElementType.AFTER);
            if (after) {
                clone.appendChild(after);
            }
            this.counters.pop(counters);
            if ((style && (this.options.copyStyles || isSVGElementNode(node)) && !isIFrameElement(node)) ||
                copyStyles) {
                copyCSSStyles(style, clone, this.options.onCopyProperty);
            }
            if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
                this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);
            }
            if ((isTextareaElement(node) || isSelectElement(node)) &&
                (isTextareaElement(clone) || isSelectElement(clone))) {
                clone.value = node.value;
            }
            return clone;
        }
        return node.cloneNode(false);
    };
    DocumentCloner.prototype.resolvePseudoContent = function (node, clone, style, pseudoElt) {
        var _this = this;
        if (!style) {
            return;
        }
        var value = style.content;
        var document = clone.ownerDocument;
        if (!document ||
            !value ||
            value === 'normal' ||
            value === 'none' ||
            value === '-moz-alt-content' ||
            style.display === 'none') {
            return;
        }
        this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
        var declaration = new CSSParsedPseudoDeclaration(this.context, style);
        var anonymousReplacedElement = document.createElement('html2canvaspseudoelement');
        copyCSSStyles(style, anonymousReplacedElement, this.options.onCopyProperty);
        declaration.content.forEach(function (token) {
            if (token.type === 0 /* TokenType.STRING_TOKEN */) {
                anonymousReplacedElement.appendChild(document.createTextNode(token.value));
            }
            else if (token.type === 22 /* TokenType.URL_TOKEN */) {
                var img = document.createElement('img');
                img.src = token.value;
                img.style.opacity = '1';
                anonymousReplacedElement.appendChild(img);
            }
            else if (token.type === 18 /* TokenType.FUNCTION */) {
                if (token.name === 'attr') {
                    var attr = token.values.filter(isIdentToken);
                    if (attr.length) {
                        anonymousReplacedElement.appendChild(document.createTextNode(node.getAttribute(attr[0].value) || ''));
                    }
                }
                else if (token.name === 'counter') {
                    var _a = token.values.filter(nonFunctionArgSeparator), counter = _a[0], counterStyle = _a[1];
                    if (counter && isIdentToken(counter)) {
                        var counterState = _this.counters.getCounterValue(counter.value);
                        var counterType = counterStyle && isIdentToken(counterStyle)
                            ? listStyleType.parse(_this.context, counterStyle.value)
                            : 3 /* LIST_STYLE_TYPE.DECIMAL */;
                        anonymousReplacedElement.appendChild(document.createTextNode(createCounterText(counterState, counterType, false)));
                    }
                }
                else if (token.name === 'counters') {
                    var _b = token.values.filter(nonFunctionArgSeparator), counter = _b[0], delim = _b[1], counterStyle = _b[2];
                    if (counter && isIdentToken(counter)) {
                        var counterStates = _this.counters.getCounterValues(counter.value);
                        var counterType_1 = counterStyle && isIdentToken(counterStyle)
                            ? listStyleType.parse(_this.context, counterStyle.value)
                            : 3 /* LIST_STYLE_TYPE.DECIMAL */;
                        var separator = delim && delim.type === 0 /* TokenType.STRING_TOKEN */ ? delim.value : '';
                        var text = counterStates
                            .map(function (value) { return createCounterText(value, counterType_1, false); })
                            .join(separator);
                        anonymousReplacedElement.appendChild(document.createTextNode(text));
                    }
                }
                else ;
            }
            else if (token.type === 20 /* TokenType.IDENT_TOKEN */) {
                switch (token.value) {
                    case 'open-quote':
                        anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, _this.quoteDepth++, true)));
                        break;
                    case 'close-quote':
                        anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, --_this.quoteDepth, false)));
                        break;
                    default:
                        // safari doesn't parse string tokens correctly because of lack of quotes
                        anonymousReplacedElement.appendChild(document.createTextNode(token.value));
                }
            }
        });
        anonymousReplacedElement.className = "".concat(PSEUDO_HIDE_ELEMENT_CLASS_BEFORE, " ").concat(PSEUDO_HIDE_ELEMENT_CLASS_AFTER);
        var newClassName = pseudoElt === PseudoElementType.BEFORE
            ? " ".concat(PSEUDO_HIDE_ELEMENT_CLASS_BEFORE)
            : " ".concat(PSEUDO_HIDE_ELEMENT_CLASS_AFTER);
        if (isSVGElementNode(clone)) {
            clone.className.baseValue += newClassName;
        }
        else {
            clone.className += newClassName;
        }
        return anonymousReplacedElement;
    };
    DocumentCloner.destroy = function (ownerDocument, id) {
        var ownerContainer = ownerDocument.getElementById(id);
        var documentContainer = document.getElementById(id);
        var container = ownerContainer || documentContainer;
        if (!container) {
            return false;
        }
        // cleanup iframe first to prevent memory leaks
        try {
            // Clear the iframe's content
            container.src = 'about:blank';
            // Optionally allow the browser to handle garbage collection
            if (container.contentWindow) {
                container.contentWindow.document.open();
                container.contentWindow.document.write('');
                container.contentWindow.document.close();
            }
        }
        catch (_a) { }
        // Remove the iframe from the DOM
        if (container.parentNode) {
            container.parentNode.removeChild(container);
            return true;
        }
        return false;
    };
    return DocumentCloner;
}());
var PseudoElementType;
(function (PseudoElementType) {
    PseudoElementType[PseudoElementType["BEFORE"] = 0] = "BEFORE";
    PseudoElementType[PseudoElementType["AFTER"] = 1] = "AFTER";
})(PseudoElementType || (PseudoElementType = {}));
var iframeIdCounter = 0;
var createIFrameContainer = function (ownerDocument, bounds) {
    var cloneIframeContainer = ownerDocument.createElement('iframe');
    var uniqueId = "html2canvas-iframe-".concat(iframeIdCounter++);
    cloneIframeContainer.setAttribute('id', uniqueId);
    cloneIframeContainer.className = 'html2canvas-container';
    cloneIframeContainer.style.visibility = 'hidden';
    cloneIframeContainer.style.position = 'fixed';
    cloneIframeContainer.style.left = '-10000px';
    cloneIframeContainer.style.top = '0px';
    cloneIframeContainer.style.border = '0';
    cloneIframeContainer.width = bounds.width.toString();
    cloneIframeContainer.height = bounds.height.toString();
    cloneIframeContainer.style.width = bounds.width.toString() + 'px';
    cloneIframeContainer.style.height = bounds.height.toString() + 'px';
    cloneIframeContainer.scrolling = 'no'; // ios won't scroll without it
    cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, 'true');
    ownerDocument.body.appendChild(cloneIframeContainer);
    return cloneIframeContainer;
};
var imageReady = function (img) {
    return new Promise(function (resolve) {
        if (img.complete) {
            resolve();
            return;
        }
        if (!img.src) {
            resolve();
            return;
        }
        img.onload = resolve;
        img.onerror = resolve;
    });
};
var imagesReady = function (document) {
    return Promise.all([].slice.call(document.images, 0).map(imageReady));
};
var iframeLoader = function (iframe) {
    return new Promise(function (resolve, reject) {
        var cloneWindow = iframe.contentWindow;
        if (!cloneWindow) {
            return reject("No window assigned for iframe");
        }
        var documentClone = cloneWindow.document;
        cloneWindow.onload = iframe.onload = function () {
            cloneWindow.onload = iframe.onload = null;
            var interval = setInterval(function () {
                if (documentClone.body.childNodes.length > 0 && documentClone.readyState === 'complete') {
                    clearInterval(interval);
                    resolve(iframe);
                }
            }, 50);
        };
    });
};
var ignoredStyleProperties = new Set([
    'all', // #2476
    'd', // #2483
    'content', // Safari shows pseudoelements if content is set
]);
var copyCSSStyles = function (style, target, onCopyProperty) {
    // Edge does not provide value for cssText.
    // Iterate forward so we can break early when reaching CSS custom properties (--*)
    // which browsers like Firefox report first and in large numbers, causing significant
    // slowdowns when copied unnecessarily. See https://github.com/niklasvh/html2canvas/issues/3191
    for (var i = 0; i < style.length; i++) {
        var property = style.item(i);
        if (ignoredStyleProperties.has(property)) {
            continue;
        }
        if (onCopyProperty) {
            // If the callback returns true the caller has handled this property; skip default copy.
            if (onCopyProperty(property, style, target)) {
                continue;
            }
        }
        target.style.setProperty(property, style.getPropertyValue(property));
    }
    return target;
};
var serializeDoctype = function (doctype) {
    var str = '';
    if (doctype) {
        str += '<!DOCTYPE ';
        if (doctype.name) {
            str += doctype.name;
        }
        if (doctype.internalSubset) {
            str += doctype.internalSubset;
        }
        if (doctype.publicId) {
            str += "\"".concat(doctype.publicId, "\"");
        }
        if (doctype.systemId) {
            str += "\"".concat(doctype.systemId, "\"");
        }
        str += '>';
    }
    return str;
};
var restoreOwnerScroll = function (ownerDocument, x, y) {
    if (ownerDocument &&
        ownerDocument.defaultView &&
        (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) {
        ownerDocument.defaultView.scrollTo(x, y);
    }
};
var restoreNodeScroll = function (_a) {
    var element = _a[0], x = _a[1], y = _a[2];
    element.scrollLeft = x;
    element.scrollTop = y;
};
var PSEUDO_BEFORE = ':before';
var PSEUDO_AFTER = ':after';
var PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = '___html2canvas___pseudoelement_before';
var PSEUDO_HIDE_ELEMENT_CLASS_AFTER = '___html2canvas___pseudoelement_after';
var PSEUDO_HIDE_ELEMENT_STYLE = "{\n    content: \"\" !important;\n    display: none !important;\n}";
var createPseudoHideStyles = function (body) {
    createStyles(body, ".".concat(PSEUDO_HIDE_ELEMENT_CLASS_BEFORE).concat(PSEUDO_BEFORE).concat(PSEUDO_HIDE_ELEMENT_STYLE, "\n         .").concat(PSEUDO_HIDE_ELEMENT_CLASS_AFTER).concat(PSEUDO_AFTER).concat(PSEUDO_HIDE_ELEMENT_STYLE));
};
var createStyles = function (body, styles) {
    var document = body.ownerDocument;
    if (document) {
        var style = document.createElement('style');
        style.textContent = styles;
        body.appendChild(style);
    }
};
var addBase = function (targetELement, referenceDocument) {
    var _a;
    var baseNode = referenceDocument.createElement('base');
    baseNode.href = referenceDocument.baseURI;
    var headEle = targetELement.getElementsByTagName('head').item(0);
    headEle === null || headEle === void 0 ? void 0 : headEle.insertBefore(baseNode, (_a = headEle === null || headEle === void 0 ? void 0 : headEle.firstChild) !== null && _a !== void 0 ? _a : null);
};

var paddingBox = function (element) {
    var bounds = element.bounds;
    var styles = element.styles;
    return bounds.add(styles.borderLeftWidth, styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth), -(styles.borderTopWidth + styles.borderBottomWidth));
};
var contentBox = function (element) {
    var styles = element.styles;
    var bounds = element.bounds;
    var paddingLeft = getAbsoluteValue(styles.paddingLeft, bounds.width);
    var paddingRight = getAbsoluteValue(styles.paddingRight, bounds.width);
    var paddingTop = getAbsoluteValue(styles.paddingTop, bounds.width);
    var paddingBottom = getAbsoluteValue(styles.paddingBottom, bounds.width);
    return bounds.add(paddingLeft + styles.borderLeftWidth, paddingTop + styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth + paddingLeft + paddingRight), -(styles.borderTopWidth + styles.borderBottomWidth + paddingTop + paddingBottom));
};

var PathType;
(function (PathType) {
    PathType[PathType["VECTOR"] = 0] = "VECTOR";
    PathType[PathType["BEZIER_CURVE"] = 1] = "BEZIER_CURVE";
})(PathType || (PathType = {}));
var equalPath = function (a, b) {
    if (a.length === b.length) {
        return a.some(function (v, i) { return v === b[i]; });
    }
    return false;
};
var reversePath = function (path) {
    return path
        .slice(0)
        .reverse()
        .map(function (point) {
        return point.reverse();
    });
};

var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.type = PathType.VECTOR;
        this.x = x;
        this.y = y;
    }
    Vector.prototype.add = function (deltaX, deltaY) {
        return new Vector(this.x + deltaX, this.y + deltaY);
    };
    Vector.prototype.reverse = function () {
        return this;
    };
    return Vector;
}());

var calculateBackgroundPositioningArea = function (backgroundOrigin, element) {
    if (backgroundOrigin === 0 /* BACKGROUND_ORIGIN.BORDER_BOX */) {
        return element.bounds;
    }
    if (backgroundOrigin === 2 /* BACKGROUND_ORIGIN.CONTENT_BOX */) {
        return contentBox(element);
    }
    return paddingBox(element);
};
var calculateBackgroundPaintingArea = function (backgroundClip, element) {
    if (backgroundClip === 0 /* BACKGROUND_CLIP.BORDER_BOX */) {
        return element.bounds;
    }
    if (backgroundClip === 2 /* BACKGROUND_CLIP.CONTENT_BOX */) {
        return contentBox(element);
    }
    // For background-clip: text, use padding-box as the initial painting area.
    // The actual text-shape clipping happens at render time via canvas compositing.
    if (backgroundClip === 3 /* BACKGROUND_CLIP.TEXT */) {
        return paddingBox(element);
    }
    return paddingBox(element);
};
var calculateBackgroundRendering = function (container, index, intrinsicSize) {
    var backgroundPositioningArea = calculateBackgroundPositioningArea(getBackgroundValueForIndex(container.styles.backgroundOrigin, index), container);
    var backgroundPaintingArea = calculateBackgroundPaintingArea(getBackgroundValueForIndex(container.styles.backgroundClip, index), container);
    var backgroundImageSize = calculateBackgroundSize(getBackgroundValueForIndex(container.styles.backgroundSize, index), intrinsicSize, backgroundPositioningArea);
    var sizeWidth = backgroundImageSize[0], sizeHeight = backgroundImageSize[1];
    var position = getAbsoluteValueForTuple(getBackgroundValueForIndex(container.styles.backgroundPosition, index), backgroundPositioningArea.width - sizeWidth, backgroundPositioningArea.height - sizeHeight);
    var path = calculateBackgroundRepeatPath(getBackgroundValueForIndex(container.styles.backgroundRepeat, index), position, backgroundImageSize, backgroundPositioningArea, backgroundPaintingArea);
    var offsetX = Math.round(backgroundPositioningArea.left + position[0]);
    var offsetY = Math.round(backgroundPositioningArea.top + position[1]);
    sizeWidth = Math.max(1, sizeWidth);
    sizeHeight = Math.max(1, sizeHeight);
    return [path, offsetX, offsetY, sizeWidth, sizeHeight];
};
var isAuto = function (token) { return isIdentToken(token) && token.value === BACKGROUND_SIZE.AUTO; };
var hasIntrinsicValue = function (value) { return typeof value === 'number'; };
var calculateBackgroundSize = function (size, _a, bounds) {
    var intrinsicWidth = _a[0], intrinsicHeight = _a[1], intrinsicProportion = _a[2];
    var first = size[0], second = size[1];
    if (!first) {
        return [0, 0];
    }
    if (isLengthPercentage(first) && second && isLengthPercentage(second)) {
        return [getAbsoluteValue(first, bounds.width), getAbsoluteValue(second, bounds.height)];
    }
    var hasIntrinsicProportion = hasIntrinsicValue(intrinsicProportion);
    if (isIdentToken(first) && (first.value === BACKGROUND_SIZE.CONTAIN || first.value === BACKGROUND_SIZE.COVER)) {
        if (hasIntrinsicValue(intrinsicProportion)) {
            var targetRatio = bounds.width / bounds.height;
            return targetRatio < intrinsicProportion !== (first.value === BACKGROUND_SIZE.COVER)
                ? [bounds.width, bounds.width / intrinsicProportion]
                : [bounds.height * intrinsicProportion, bounds.height];
        }
        return [bounds.width, bounds.height];
    }
    var hasIntrinsicWidth = hasIntrinsicValue(intrinsicWidth);
    var hasIntrinsicHeight = hasIntrinsicValue(intrinsicHeight);
    var hasIntrinsicDimensions = hasIntrinsicWidth || hasIntrinsicHeight;
    // If the background-size is auto or auto auto:
    if (isAuto(first) && (!second || isAuto(second))) {
        // If the image has both horizontal and vertical intrinsic dimensions, it's rendered at that size.
        if (hasIntrinsicWidth && hasIntrinsicHeight) {
            return [intrinsicWidth, intrinsicHeight];
        }
        // If the image has no intrinsic dimensions and has no intrinsic proportions,
        // it's rendered at the size of the background positioning area.
        if (!hasIntrinsicProportion && !hasIntrinsicDimensions) {
            return [bounds.width, bounds.height];
        }
        // TODO If the image has no intrinsic dimensions but has intrinsic proportions, it's rendered as if contain had been specified instead.
        // If the image has only one intrinsic dimension and has intrinsic proportions, it's rendered at the size corresponding to that one dimension.
        // The other dimension is computed using the specified dimension and the intrinsic proportions.
        if (hasIntrinsicDimensions && hasIntrinsicProportion) {
            var width_1 = hasIntrinsicWidth
                ? intrinsicWidth
                : intrinsicHeight * intrinsicProportion;
            var height_1 = hasIntrinsicHeight
                ? intrinsicHeight
                : intrinsicWidth / intrinsicProportion;
            return [width_1, height_1];
        }
        // If the image has only one intrinsic dimension but has no intrinsic proportions,
        // it's rendered using the specified dimension and the other dimension of the background positioning area.
        var width_2 = hasIntrinsicWidth ? intrinsicWidth : bounds.width;
        var height_2 = hasIntrinsicHeight ? intrinsicHeight : bounds.height;
        return [width_2, height_2];
    }
    // If the image has intrinsic proportions, it's stretched to the specified dimension.
    // The unspecified dimension is computed using the specified dimension and the intrinsic proportions.
    if (hasIntrinsicProportion) {
        var width_3 = 0;
        var height_3 = 0;
        if (isLengthPercentage(first)) {
            width_3 = getAbsoluteValue(first, bounds.width);
        }
        else if (isLengthPercentage(second)) {
            height_3 = getAbsoluteValue(second, bounds.height);
        }
        if (isAuto(first)) {
            width_3 = height_3 * intrinsicProportion;
        }
        else if (!second || isAuto(second)) {
            height_3 = width_3 / intrinsicProportion;
        }
        return [width_3, height_3];
    }
    // If the image has no intrinsic proportions, it's stretched to the specified dimension.
    // The unspecified dimension is computed using the image's corresponding intrinsic dimension,
    // if there is one. If there is no such intrinsic dimension,
    // it becomes the corresponding dimension of the background positioning area.
    var width = null;
    var height = null;
    if (isLengthPercentage(first)) {
        width = getAbsoluteValue(first, bounds.width);
    }
    else if (second && isLengthPercentage(second)) {
        height = getAbsoluteValue(second, bounds.height);
    }
    if (width !== null && (!second || isAuto(second))) {
        height =
            hasIntrinsicWidth && hasIntrinsicHeight
                ? (width / intrinsicWidth) * intrinsicHeight
                : bounds.height;
    }
    if (height !== null && isAuto(first)) {
        width =
            hasIntrinsicWidth && hasIntrinsicHeight
                ? (height / intrinsicHeight) * intrinsicWidth
                : bounds.width;
    }
    if (width !== null && height !== null) {
        return [width, height];
    }
    throw new Error("Unable to calculate background-size for element");
};
var getBackgroundValueForIndex = function (values, index) {
    var value = values[index];
    if (typeof value === 'undefined') {
        return values[0];
    }
    return value;
};
var calculateBackgroundRepeatPath = function (repeat, _a, _b, backgroundPositioningArea, backgroundPaintingArea) {
    var x = _a[0], y = _a[1];
    var width = _b[0], height = _b[1];
    switch (repeat) {
        case 2 /* BACKGROUND_REPEAT.REPEAT_X */:
            return [
                new Vector(Math.round(backgroundPositioningArea.left), Math.round(backgroundPositioningArea.top + y)),
                new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(backgroundPositioningArea.top + y)),
                new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(height + backgroundPositioningArea.top + y)),
                new Vector(Math.round(backgroundPositioningArea.left), Math.round(height + backgroundPositioningArea.top + y)),
            ];
        case 3 /* BACKGROUND_REPEAT.REPEAT_Y */:
            return [
                new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top)),
                new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top)),
                new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top)),
                new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top)),
            ];
        case 1 /* BACKGROUND_REPEAT.NO_REPEAT */:
            return [
                new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y)),
                new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y)),
                new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y + height)),
                new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y + height)),
            ];
        default:
            return [
                new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.top)),
                new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.top)),
                new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top)),
                new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top)),
            ];
    }
};

var lerp = function (a, b, t) {
    return new Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
};
var BezierCurve = /** @class */ (function () {
    function BezierCurve(start, startControl, endControl, end) {
        this.type = PathType.BEZIER_CURVE;
        this.start = start;
        this.startControl = startControl;
        this.endControl = endControl;
        this.end = end;
    }
    BezierCurve.prototype.subdivide = function (t, firstHalf) {
        var ab = lerp(this.start, this.startControl, t);
        var bc = lerp(this.startControl, this.endControl, t);
        var cd = lerp(this.endControl, this.end, t);
        var abbc = lerp(ab, bc, t);
        var bccd = lerp(bc, cd, t);
        var dest = lerp(abbc, bccd, t);
        return firstHalf ? new BezierCurve(this.start, ab, abbc, dest) : new BezierCurve(dest, bccd, cd, this.end);
    };
    BezierCurve.prototype.add = function (deltaX, deltaY) {
        return new BezierCurve(this.start.add(deltaX, deltaY), this.startControl.add(deltaX, deltaY), this.endControl.add(deltaX, deltaY), this.end.add(deltaX, deltaY));
    };
    BezierCurve.prototype.reverse = function () {
        return new BezierCurve(this.end, this.endControl, this.startControl, this.start);
    };
    return BezierCurve;
}());
var isBezierCurve = function (path) { return path.type === PathType.BEZIER_CURVE; };

var parsePathForBorder = function (curves, borderSide) {
    switch (borderSide) {
        case 0:
            return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftPaddingBox, curves.topRightBorderBox, curves.topRightPaddingBox);
        case 1:
            return createPathFromCurves(curves.topRightBorderBox, curves.topRightPaddingBox, curves.bottomRightBorderBox, curves.bottomRightPaddingBox);
        case 2:
            return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox);
        case 3:
        default:
            return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox, curves.topLeftBorderBox, curves.topLeftPaddingBox);
    }
};
var parsePathForBorderDoubleOuter = function (curves, borderSide) {
    switch (borderSide) {
        case 0:
            return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftBorderDoubleOuterBox, curves.topRightBorderBox, curves.topRightBorderDoubleOuterBox);
        case 1:
            return createPathFromCurves(curves.topRightBorderBox, curves.topRightBorderDoubleOuterBox, curves.bottomRightBorderBox, curves.bottomRightBorderDoubleOuterBox);
        case 2:
            return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightBorderDoubleOuterBox, curves.bottomLeftBorderBox, curves.bottomLeftBorderDoubleOuterBox);
        case 3:
        default:
            return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftBorderDoubleOuterBox, curves.topLeftBorderBox, curves.topLeftBorderDoubleOuterBox);
    }
};
var parsePathForBorderDoubleInner = function (curves, borderSide) {
    switch (borderSide) {
        case 0:
            return createPathFromCurves(curves.topLeftBorderDoubleInnerBox, curves.topLeftPaddingBox, curves.topRightBorderDoubleInnerBox, curves.topRightPaddingBox);
        case 1:
            return createPathFromCurves(curves.topRightBorderDoubleInnerBox, curves.topRightPaddingBox, curves.bottomRightBorderDoubleInnerBox, curves.bottomRightPaddingBox);
        case 2:
            return createPathFromCurves(curves.bottomRightBorderDoubleInnerBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderDoubleInnerBox, curves.bottomLeftPaddingBox);
        case 3:
        default:
            return createPathFromCurves(curves.bottomLeftBorderDoubleInnerBox, curves.bottomLeftPaddingBox, curves.topLeftBorderDoubleInnerBox, curves.topLeftPaddingBox);
    }
};
var parsePathForBorderStroke = function (curves, borderSide) {
    switch (borderSide) {
        case 0:
            return createStrokePathFromCurves(curves.topLeftBorderStroke, curves.topRightBorderStroke);
        case 1:
            return createStrokePathFromCurves(curves.topRightBorderStroke, curves.bottomRightBorderStroke);
        case 2:
            return createStrokePathFromCurves(curves.bottomRightBorderStroke, curves.bottomLeftBorderStroke);
        case 3:
        default:
            return createStrokePathFromCurves(curves.bottomLeftBorderStroke, curves.topLeftBorderStroke);
    }
};
var createStrokePathFromCurves = function (outer1, outer2) {
    var path = [];
    if (isBezierCurve(outer1)) {
        path.push(outer1.subdivide(0.5, false));
    }
    else {
        path.push(outer1);
    }
    if (isBezierCurve(outer2)) {
        path.push(outer2.subdivide(0.5, true));
    }
    else {
        path.push(outer2);
    }
    return path;
};
var createPathFromCurves = function (outer1, inner1, outer2, inner2) {
    var path = [];
    if (isBezierCurve(outer1)) {
        path.push(outer1.subdivide(0.5, false));
    }
    else {
        path.push(outer1);
    }
    if (isBezierCurve(outer2)) {
        path.push(outer2.subdivide(0.5, true));
    }
    else {
        path.push(outer2);
    }
    if (isBezierCurve(inner2)) {
        path.push(inner2.subdivide(0.5, true).reverse());
    }
    else {
        path.push(inner2);
    }
    if (isBezierCurve(inner1)) {
        path.push(inner1.subdivide(0.5, false).reverse());
    }
    else {
        path.push(inner1);
    }
    return path;
};

var BoundCurves = /** @class */ (function () {
    function BoundCurves(element) {
        var styles = element.styles;
        var bounds = element.bounds;
        var _a = getAbsoluteValueForTuple(styles.borderTopLeftRadius, bounds.width, bounds.height), tlh = _a[0], tlv = _a[1];
        var _b = getAbsoluteValueForTuple(styles.borderTopRightRadius, bounds.width, bounds.height), trh = _b[0], trv = _b[1];
        var _c = getAbsoluteValueForTuple(styles.borderBottomRightRadius, bounds.width, bounds.height), brh = _c[0], brv = _c[1];
        var _d = getAbsoluteValueForTuple(styles.borderBottomLeftRadius, bounds.width, bounds.height), blh = _d[0], blv = _d[1];
        var factors = [];
        factors.push((tlh + trh) / bounds.width);
        factors.push((blh + brh) / bounds.width);
        factors.push((tlv + blv) / bounds.height);
        factors.push((trv + brv) / bounds.height);
        var maxFactor = Math.max.apply(Math, factors);
        if (maxFactor > 1) {
            tlh /= maxFactor;
            tlv /= maxFactor;
            trh /= maxFactor;
            trv /= maxFactor;
            brh /= maxFactor;
            brv /= maxFactor;
            blh /= maxFactor;
            blv /= maxFactor;
        }
        var topWidth = bounds.width - trh;
        var rightHeight = bounds.height - brv;
        var bottomWidth = bounds.width - brh;
        var leftHeight = bounds.height - blv;
        var borderTopWidth = styles.borderTopWidth;
        var borderRightWidth = styles.borderRightWidth;
        var borderBottomWidth = styles.borderBottomWidth;
        var borderLeftWidth = styles.borderLeftWidth;
        var paddingTop = getAbsoluteValue(styles.paddingTop, element.bounds.width);
        var paddingRight = getAbsoluteValue(styles.paddingRight, element.bounds.width);
        var paddingBottom = getAbsoluteValue(styles.paddingBottom, element.bounds.width);
        var paddingLeft = getAbsoluteValue(styles.paddingLeft, element.bounds.width);
        this.topLeftBorderDoubleOuterBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth / 3, bounds.top + borderTopWidth / 3, tlh - borderLeftWidth / 3, tlv - borderTopWidth / 3, CORNER.TOP_LEFT)
                : new Vector(bounds.left + borderLeftWidth / 3, bounds.top + borderTopWidth / 3);
        this.topRightBorderDoubleOuterBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth / 3, trh - borderRightWidth / 3, trv - borderTopWidth / 3, CORNER.TOP_RIGHT)
                : new Vector(bounds.left + bounds.width - borderRightWidth / 3, bounds.top + borderTopWidth / 3);
        this.bottomRightBorderDoubleOuterBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth / 3, brv - borderBottomWidth / 3, CORNER.BOTTOM_RIGHT)
                : new Vector(bounds.left + bounds.width - borderRightWidth / 3, bounds.top + bounds.height - borderBottomWidth / 3);
        this.bottomLeftBorderDoubleOuterBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth / 3, bounds.top + leftHeight, blh - borderLeftWidth / 3, blv - borderBottomWidth / 3, CORNER.BOTTOM_LEFT)
                : new Vector(bounds.left + borderLeftWidth / 3, bounds.top + bounds.height - borderBottomWidth / 3);
        this.topLeftBorderDoubleInnerBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + (borderLeftWidth * 2) / 3, bounds.top + (borderTopWidth * 2) / 3, tlh - (borderLeftWidth * 2) / 3, tlv - (borderTopWidth * 2) / 3, CORNER.TOP_LEFT)
                : new Vector(bounds.left + (borderLeftWidth * 2) / 3, bounds.top + (borderTopWidth * 2) / 3);
        this.topRightBorderDoubleInnerBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + topWidth, bounds.top + (borderTopWidth * 2) / 3, trh - (borderRightWidth * 2) / 3, trv - (borderTopWidth * 2) / 3, CORNER.TOP_RIGHT)
                : new Vector(bounds.left + bounds.width - (borderRightWidth * 2) / 3, bounds.top + (borderTopWidth * 2) / 3);
        this.bottomRightBorderDoubleInnerBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - (borderRightWidth * 2) / 3, brv - (borderBottomWidth * 2) / 3, CORNER.BOTTOM_RIGHT)
                : new Vector(bounds.left + bounds.width - (borderRightWidth * 2) / 3, bounds.top + bounds.height - (borderBottomWidth * 2) / 3);
        this.bottomLeftBorderDoubleInnerBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + (borderLeftWidth * 2) / 3, bounds.top + leftHeight, blh - (borderLeftWidth * 2) / 3, blv - (borderBottomWidth * 2) / 3, CORNER.BOTTOM_LEFT)
                : new Vector(bounds.left + (borderLeftWidth * 2) / 3, bounds.top + bounds.height - (borderBottomWidth * 2) / 3);
        this.topLeftBorderStroke =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth / 2, bounds.top + borderTopWidth / 2, tlh - borderLeftWidth / 2, tlv - borderTopWidth / 2, CORNER.TOP_LEFT)
                : new Vector(bounds.left + borderLeftWidth / 2, bounds.top + borderTopWidth / 2);
        this.topRightBorderStroke =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth / 2, trh - borderRightWidth / 2, trv - borderTopWidth / 2, CORNER.TOP_RIGHT)
                : new Vector(bounds.left + bounds.width - borderRightWidth / 2, bounds.top + borderTopWidth / 2);
        this.bottomRightBorderStroke =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth / 2, brv - borderBottomWidth / 2, CORNER.BOTTOM_RIGHT)
                : new Vector(bounds.left + bounds.width - borderRightWidth / 2, bounds.top + bounds.height - borderBottomWidth / 2);
        this.bottomLeftBorderStroke =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth / 2, bounds.top + leftHeight, blh - borderLeftWidth / 2, blv - borderBottomWidth / 2, CORNER.BOTTOM_LEFT)
                : new Vector(bounds.left + borderLeftWidth / 2, bounds.top + bounds.height - borderBottomWidth / 2);
        this.topLeftBorderBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT)
                : new Vector(bounds.left, bounds.top);
        this.topRightBorderBox =
            trh > 0 || trv > 0
                ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT)
                : new Vector(bounds.left + bounds.width, bounds.top);
        this.bottomRightBorderBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT)
                : new Vector(bounds.left + bounds.width, bounds.top + bounds.height);
        this.bottomLeftBorderBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT)
                : new Vector(bounds.left, bounds.top + bounds.height);
        this.topLeftPaddingBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + borderTopWidth, Math.max(0, tlh - borderLeftWidth), Math.max(0, tlv - borderTopWidth), CORNER.TOP_LEFT)
                : new Vector(bounds.left + borderLeftWidth, bounds.top + borderTopWidth);
        this.topRightPaddingBox =
            trh > 0 || trv > 0
                ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width - borderRightWidth), bounds.top + borderTopWidth, topWidth > bounds.width + borderRightWidth ? 0 : Math.max(0, trh - borderRightWidth), Math.max(0, trv - borderTopWidth), CORNER.TOP_RIGHT)
                : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + borderTopWidth);
        this.bottomRightPaddingBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth), bounds.top + Math.min(rightHeight, bounds.height - borderBottomWidth), Math.max(0, brh - borderRightWidth), Math.max(0, brv - borderBottomWidth), CORNER.BOTTOM_RIGHT)
                : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + bounds.height - borderBottomWidth);
        this.bottomLeftPaddingBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + Math.min(leftHeight, bounds.height - borderBottomWidth), Math.max(0, blh - borderLeftWidth), Math.max(0, blv - borderBottomWidth), CORNER.BOTTOM_LEFT)
                : new Vector(bounds.left + borderLeftWidth, bounds.top + bounds.height - borderBottomWidth);
        this.topLeftContentBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop, Math.max(0, tlh - (borderLeftWidth + paddingLeft)), Math.max(0, tlv - (borderTopWidth + paddingTop)), CORNER.TOP_LEFT)
                : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop);
        this.topRightContentBox =
            trh > 0 || trv > 0
                ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth + paddingLeft), bounds.top + borderTopWidth + paddingTop, topWidth > bounds.width + borderLeftWidth + paddingLeft ? 0 : trh - borderLeftWidth + paddingLeft, trv - (borderTopWidth + paddingTop), CORNER.TOP_RIGHT)
                : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + borderTopWidth + paddingTop);
        this.bottomRightContentBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - (borderLeftWidth + paddingLeft)), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth + paddingTop), Math.max(0, brh - (borderRightWidth + paddingRight)), brv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_RIGHT)
                : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
        this.bottomLeftContentBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + leftHeight, Math.max(0, blh - (borderLeftWidth + paddingLeft)), blv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_LEFT)
                : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
    }
    return BoundCurves;
}());
var CORNER;
(function (CORNER) {
    CORNER[CORNER["TOP_LEFT"] = 0] = "TOP_LEFT";
    CORNER[CORNER["TOP_RIGHT"] = 1] = "TOP_RIGHT";
    CORNER[CORNER["BOTTOM_RIGHT"] = 2] = "BOTTOM_RIGHT";
    CORNER[CORNER["BOTTOM_LEFT"] = 3] = "BOTTOM_LEFT";
})(CORNER || (CORNER = {}));
var getCurvePoints = function (x, y, r1, r2, position) {
    var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
    var ox = r1 * kappa; // control point offset horizontal
    var oy = r2 * kappa; // control point offset vertical
    var xm = x + r1; // x-middle
    var ym = y + r2; // y-middle
    switch (position) {
        case CORNER.TOP_LEFT:
            return new BezierCurve(new Vector(x, ym), new Vector(x, ym - oy), new Vector(xm - ox, y), new Vector(xm, y));
        case CORNER.TOP_RIGHT:
            return new BezierCurve(new Vector(x, y), new Vector(x + ox, y), new Vector(xm, ym - oy), new Vector(xm, ym));
        case CORNER.BOTTOM_RIGHT:
            return new BezierCurve(new Vector(xm, y), new Vector(xm, y + oy), new Vector(x + ox, ym), new Vector(x, ym));
        case CORNER.BOTTOM_LEFT:
        default:
            return new BezierCurve(new Vector(xm, ym), new Vector(xm - ox, ym), new Vector(x, y + oy), new Vector(x, y));
    }
};
var calculateBorderBoxPath = function (curves) {
    return [curves.topLeftBorderBox, curves.topRightBorderBox, curves.bottomRightBorderBox, curves.bottomLeftBorderBox];
};
/**
 * Build a border-box path expanded (or contracted) by `spread` pixels on all sides,
 * with the corner radii adjusted by the same amount per the CSS spec:
 *   shadow-radius = max(border-radius + spread, 0)
 *
 * Unlike `transformPath` which only translates corners, this function rebuilds
 * the Bézier curves so that the shadow shape matches the browser rendering.
 */
var expandBorderBoxPath = function (curves, spread) {
    // Collect the original border-box radii from the existing corner curves.
    // getCurvePoints produces BezierCurves; if a corner has no radius it's a Vector.
    var getRadii = function (corner) {
        if (isBezierCurve(corner)) {
            // For TOP_LEFT: start=(x, ym), end=(xm, y) → r1=xm-x, r2=ym-y
            // We back-calculate from the start/end points of the curve.
            // The anchor point (x,y) is the corner tip; r1 and r2 are the distances to start/end.
            var c = corner;
            // The two extremes of the curve land at (x, ym) and (xm, y).
            // r1 = |end.x - start.x| for TOP_LEFT, etc. — use max of differences.
            var dx = Math.abs(c.end.x - c.start.x);
            var dy = Math.abs(c.end.y - c.start.y);
            return [dx, dy];
        }
        return [0, 0];
    };
    var _a = getRadii(curves.topLeftBorderBox), tlH = _a[0], tlV = _a[1];
    var _b = getRadii(curves.topRightBorderBox), trH = _b[0], trV = _b[1];
    var _c = getRadii(curves.bottomRightBorderBox), brH = _c[0], brV = _c[1];
    var _d = getRadii(curves.bottomLeftBorderBox), blH = _d[0], blV = _d[1];
    // Original bounding box — read from the border-box curves.
    // TOP_LEFT corner start point is (left, top + tlV); end is (left + tlH, top).
    var tl = curves.topLeftBorderBox;
    var left = isBezierCurve(tl) ? tl.start.x : tl.x;
    var top = isBezierCurve(tl) ? tl.end.y : tl.y;
    var br = curves.bottomRightBorderBox;
    var right = isBezierCurve(br) ? br.start.x : br.x;
    var bottom = isBezierCurve(br) ? br.start.y + brV : br.y;
    var newLeft = left - spread;
    var newTop = top - spread;
    var newRight = right + spread;
    var newBottom = bottom + spread;
    var newWidth = newRight - newLeft;
    var newHeight = newBottom - newTop;
    if (newWidth <= 0 || newHeight <= 0) {
        // Shadow completely collapsed — return an empty degenerate path.
        var mid = new Vector((left + right) / 2, (top + bottom) / 2);
        return [mid, mid, mid, mid];
    }
    // Adjust radii — clamp to half the new dimensions so they don't overlap.
    var newTlH = Math.min(Math.max(0, tlH + spread), newWidth / 2);
    var newTlV = Math.min(Math.max(0, tlV + spread), newHeight / 2);
    var newTrH = Math.min(Math.max(0, trH + spread), newWidth / 2);
    var newTrV = Math.min(Math.max(0, trV + spread), newHeight / 2);
    var newBrH = Math.min(Math.max(0, brH + spread), newWidth / 2);
    var newBrV = Math.min(Math.max(0, brV + spread), newHeight / 2);
    var newBlH = Math.min(Math.max(0, blH + spread), newWidth / 2);
    var newBlV = Math.min(Math.max(0, blV + spread), newHeight / 2);
    var topWidth = newWidth - newTrH;
    var rightHeight = newHeight - newBrV;
    var bottomWidth = newWidth - newBrH;
    var leftHeight = newHeight - newBlV;
    return [
        newTlH > 0 || newTlV > 0
            ? getCurvePoints(newLeft, newTop, newTlH, newTlV, CORNER.TOP_LEFT)
            : new Vector(newLeft, newTop),
        newTrH > 0 || newTrV > 0
            ? getCurvePoints(newLeft + topWidth, newTop, newTrH, newTrV, CORNER.TOP_RIGHT)
            : new Vector(newLeft + newWidth, newTop),
        newBrH > 0 || newBrV > 0
            ? getCurvePoints(newLeft + bottomWidth, newTop + rightHeight, newBrH, newBrV, CORNER.BOTTOM_RIGHT)
            : new Vector(newLeft + newWidth, newTop + newHeight),
        newBlH > 0 || newBlV > 0
            ? getCurvePoints(newLeft, newTop + leftHeight, newBlH, newBlV, CORNER.BOTTOM_LEFT)
            : new Vector(newLeft, newTop + newHeight),
    ];
};
var calculateContentBoxPath = function (curves) {
    return [
        curves.topLeftContentBox,
        curves.topRightContentBox,
        curves.bottomRightContentBox,
        curves.bottomLeftContentBox,
    ];
};
var calculatePaddingBoxPath = function (curves) {
    return [
        curves.topLeftPaddingBox,
        curves.topRightPaddingBox,
        curves.bottomRightPaddingBox,
        curves.bottomLeftPaddingBox,
    ];
};

var TransformEffect = /** @class */ (function () {
    function TransformEffect(offsetX, offsetY, matrix) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.matrix = matrix;
        this.type = 0 /* EffectType.TRANSFORM */;
        this.target = 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */;
    }
    return TransformEffect;
}());
var ClipEffect = /** @class */ (function () {
    function ClipEffect(path, target) {
        this.path = path;
        this.target = target;
        this.type = 1 /* EffectType.CLIP */;
    }
    return ClipEffect;
}());
var OpacityEffect = /** @class */ (function () {
    function OpacityEffect(opacity) {
        this.opacity = opacity;
        this.type = 2 /* EffectType.OPACITY */;
        this.target = 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */;
    }
    return OpacityEffect;
}());
var FilterEffect = /** @class */ (function () {
    function FilterEffect(filter) {
        this.filter = filter;
        this.type = 3 /* EffectType.FILTER */;
        this.target = 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */;
    }
    return FilterEffect;
}());
var MixBlendModeEffect = /** @class */ (function () {
    function MixBlendModeEffect(mixBlendMode) {
        this.mixBlendMode = mixBlendMode;
        this.type = 4 /* EffectType.MIX_BLEND_MODE */;
        this.target = 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */;
    }
    return MixBlendModeEffect;
}());
var isTransformEffect = function (effect) {
    return effect.type === 0 /* EffectType.TRANSFORM */;
};
var isClipEffect = function (effect) { return effect.type === 1 /* EffectType.CLIP */; };
var isOpacityEffect = function (effect) { return effect.type === 2 /* EffectType.OPACITY */; };
var isFilterEffect = function (effect) { return effect.type === 3 /* EffectType.FILTER */; };
var isMixBlendModeEffect = function (effect) {
    return effect.type === 4 /* EffectType.MIX_BLEND_MODE */;
};

var SMALL_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

var SAMPLE_TEXT = 'Hidden Text';
var FontMetrics = /** @class */ (function () {
    function FontMetrics(document, baselineAdjustment) {
        if (baselineAdjustment === void 0) { baselineAdjustment = 2; }
        this._data = {};
        this._document = document;
        this._baselineAdjustment = baselineAdjustment;
    }
    FontMetrics.prototype.parseMetrics = function (fontFamily, fontSize) {
        var container = this._document.createElement('div');
        var img = this._document.createElement('img');
        var span = this._document.createElement('span');
        var body = this._document.body;
        container.style.visibility = 'hidden';
        container.style.fontFamily = fontFamily;
        container.style.fontSize = fontSize;
        container.style.margin = '0';
        container.style.padding = '0';
        container.style.whiteSpace = 'nowrap';
        body.appendChild(container);
        img.src = SMALL_IMAGE;
        img.width = 1;
        img.height = 1;
        img.style.margin = '0';
        img.style.padding = '0';
        img.style.verticalAlign = 'baseline';
        span.style.fontFamily = fontFamily;
        span.style.fontSize = fontSize;
        span.style.margin = '0';
        span.style.padding = '0';
        span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
        container.appendChild(span);
        container.appendChild(img);
        var baseline = img.offsetTop - span.offsetTop + this._baselineAdjustment;
        container.removeChild(span);
        container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
        container.style.lineHeight = 'normal';
        img.style.verticalAlign = 'super';
        var middle = img.offsetTop - container.offsetTop + this._baselineAdjustment;
        body.removeChild(container);
        return { baseline: baseline, middle: middle };
    };
    FontMetrics.prototype.getMetrics = function (fontFamily, fontSize) {
        var key = "".concat(fontFamily, " ").concat(fontSize);
        if (typeof this._data[key] === 'undefined') {
            this._data[key] = this.parseMetrics(fontFamily, fontSize);
        }
        return this._data[key];
    };
    FontMetrics.prototype.getRawMetrics = function (fontFamily, fontSize) {
        var key = "__raw__".concat(fontFamily, " ").concat(fontSize);
        if (typeof this._data[key] === 'undefined') {
            var container = this._document.createElement('div');
            var img = this._document.createElement('img');
            var span = this._document.createElement('span');
            var body = this._document.body;
            container.style.visibility = 'hidden';
            container.style.fontFamily = fontFamily;
            container.style.fontSize = fontSize;
            container.style.margin = '0';
            container.style.padding = '0';
            container.style.whiteSpace = 'nowrap';
            body.appendChild(container);
            img.src = SMALL_IMAGE;
            img.width = 1;
            img.height = 1;
            img.style.margin = '0';
            img.style.padding = '0';
            img.style.verticalAlign = 'baseline';
            span.style.fontFamily = fontFamily;
            span.style.fontSize = fontSize;
            span.style.margin = '0';
            span.style.padding = '0';
            span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
            container.appendChild(span);
            container.appendChild(img);
            var baseline = img.offsetTop - span.offsetTop;
            container.removeChild(span);
            container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
            container.style.lineHeight = 'normal';
            img.style.verticalAlign = 'super';
            var middle = img.offsetTop - container.offsetTop;
            body.removeChild(container);
            this._data[key] = { baseline: baseline, middle: middle };
        }
        return this._data[key];
    };
    return FontMetrics;
}());

var calculateObjectFitBounds = function (objectFit, naturalWidth, naturalHeight, clientWidth, clientHeight) {
    var naturalRatio = naturalWidth / naturalHeight;
    var clientRatio = clientWidth / clientHeight;
    // 'object-position' is not currently supported, so use default value of 50% 50%.
    var objectPositionX = 0.5;
    var objectPositionY = 0.5;
    var srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight;
    if (objectFit === "scale-down" /* OBJECT_FIT.SCALE_DOWN */) {
        objectFit =
            naturalWidth < clientWidth && naturalHeight < clientHeight
                ? "none" /* OBJECT_FIT.NONE */
                : "contain" /* OBJECT_FIT.CONTAIN */; // at least one axis is greater or equal in size
    }
    switch (objectFit) {
        case "contain" /* OBJECT_FIT.CONTAIN */:
            srcX = 0;
            srcY = 0;
            srcWidth = naturalWidth;
            srcHeight = naturalHeight;
            if (naturalRatio < clientRatio) {
                // snap to top/bottom
                destY = 0;
                destHeight = clientHeight;
                destWidth = destHeight * naturalRatio;
                destX = (clientWidth - destWidth) * objectPositionX;
            }
            else {
                // snap to left/right
                destX = 0;
                destWidth = clientWidth;
                destHeight = destWidth / naturalRatio;
                destY = (clientHeight - destHeight) * objectPositionY;
            }
            break;
        case "cover" /* OBJECT_FIT.COVER */:
            destX = 0;
            destY = 0;
            destWidth = clientWidth;
            destHeight = clientHeight;
            if (naturalRatio < clientRatio) {
                // fill left/right
                srcX = 0;
                srcWidth = naturalWidth;
                srcHeight = clientHeight * (naturalWidth / clientWidth);
                srcY = (naturalHeight - srcHeight) * objectPositionY;
            }
            else {
                // fill top/bottom
                srcY = 0;
                srcHeight = naturalHeight;
                srcWidth = clientWidth * (naturalHeight / clientHeight);
                srcX = (naturalWidth - srcWidth) * objectPositionX;
            }
            break;
        case "none" /* OBJECT_FIT.NONE */:
            if (naturalWidth < clientWidth) {
                srcX = 0;
                srcWidth = naturalWidth;
                destX = (clientWidth - naturalWidth) * objectPositionX;
                destWidth = naturalWidth;
            }
            else {
                srcX = (naturalWidth - clientWidth) * objectPositionX;
                srcWidth = clientWidth;
                destX = 0;
                destWidth = clientWidth;
            }
            if (naturalHeight < clientHeight) {
                srcY = 0;
                srcHeight = naturalHeight;
                destY = (clientHeight - naturalHeight) * objectPositionY;
                destHeight = naturalHeight;
            }
            else {
                srcY = (naturalHeight - clientHeight) * objectPositionY;
                srcHeight = clientHeight;
                destY = 0;
                destHeight = clientHeight;
            }
            break;
        case "fill" /* OBJECT_FIT.FILL */:
        default:
            srcX = 0;
            srcY = 0;
            srcWidth = naturalWidth;
            srcHeight = naturalHeight;
            destX = 0;
            destY = 0;
            destWidth = clientWidth;
            destHeight = clientHeight;
            break;
    }
    return {
        src: new Bounds(srcX, srcY, srcWidth, srcHeight),
        dest: new Bounds(destX, destY, destWidth, destHeight),
    };
};

var Renderer = /** @class */ (function () {
    function Renderer(context, options) {
        this.context = context;
        this.options = options;
    }
    return Renderer;
}());

var StackingContext = /** @class */ (function () {
    function StackingContext(container) {
        this.element = container;
        this.inlineLevel = [];
        this.nonInlineLevel = [];
        this.negativeZIndex = [];
        this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
        this.positiveZIndex = [];
        this.nonPositionedFloats = [];
        this.nonPositionedInlineLevel = [];
    }
    return StackingContext;
}());
var ElementPaint = /** @class */ (function () {
    function ElementPaint(container, parent) {
        this.container = container;
        this.parent = parent;
        this.effects = [];
        this._collectedEffects = null;
        this.curves = new BoundCurves(this.container);
        if (this.container.styles.opacity < 1) {
            this.effects.push(new OpacityEffect(this.container.styles.opacity));
        }
        if (this.container.styles.transform !== null) {
            var offsetX = this.container.bounds.left + getNumber(this.container.styles.transformOrigin[0]);
            var offsetY = this.container.bounds.top + getNumber(this.container.styles.transformOrigin[1]);
            var matrix = this.container.styles.transform;
            this.effects.push(new TransformEffect(offsetX, offsetY, matrix));
        }
        if (this.container.styles.overflowX !== 0 /* OVERFLOW.VISIBLE */) {
            var borderBox = calculateBorderBoxPath(this.curves);
            var paddingBox = calculatePaddingBoxPath(this.curves);
            if (equalPath(borderBox, paddingBox)) {
                this.effects.push(new ClipEffect(borderBox, 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */));
            }
            else {
                this.effects.push(new ClipEffect(borderBox, 2 /* EffectTarget.BACKGROUND_BORDERS */));
                this.effects.push(new ClipEffect(paddingBox, 4 /* EffectTarget.CONTENT */));
            }
        }
        if (this.container.styles.isFiltered()) {
            this.effects.push(new FilterEffect(this.container.styles.filter));
        }
        if (this.container.styles.mixBlendMode !== 0 /* MIX_BLEND_MODE.NORMAL */) {
            this.effects.push(new MixBlendModeEffect(this.container.styles.mixBlendMode));
        }
    }
    ElementPaint.prototype.getEffects = function (target) {
        if (!this._collectedEffects) {
            this._collectedEffects = this._computeEffects();
        }
        return this._collectedEffects.filter(function (effect) { return contains(effect.target, target); });
    };
    ElementPaint.prototype._computeEffects = function () {
        var inFlow = [2 /* POSITION.ABSOLUTE */, 3 /* POSITION.FIXED */].indexOf(this.container.styles.position) === -1;
        var parent = this.parent;
        var effects = this.effects.slice(0);
        while (parent) {
            var croplessEffects = parent.effects.filter(function (effect) { return !isClipEffect(effect); });
            if (inFlow || parent.container.styles.position !== 0 /* POSITION.STATIC */ || !parent.parent) {
                inFlow = [2 /* POSITION.ABSOLUTE */, 3 /* POSITION.FIXED */].indexOf(parent.container.styles.position) === -1;
                if (parent.container.styles.overflowX !== 0 /* OVERFLOW.VISIBLE */) {
                    var borderBox = calculateBorderBoxPath(parent.curves);
                    var paddingBox = calculatePaddingBoxPath(parent.curves);
                    if (!equalPath(borderBox, paddingBox)) {
                        effects.unshift(new ClipEffect(paddingBox, 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */));
                    }
                }
            }
            effects.unshift.apply(effects, croplessEffects);
            parent = parent.parent;
        }
        return effects;
    };
    return ElementPaint;
}());
var parseStackTree = function (parent, stackingContext, realStackingContext, listItems) {
    parent.container.elements.forEach(function (child) {
        var treatAsRealStackingContext = contains(child.flags, 4 /* FLAGS.CREATES_REAL_STACKING_CONTEXT */);
        var createsStackingContext = contains(child.flags, 2 /* FLAGS.CREATES_STACKING_CONTEXT */);
        var paintContainer = new ElementPaint(child, parent);
        if (contains(child.styles.display, 2048 /* DISPLAY.LIST_ITEM */)) {
            listItems.push(paintContainer);
        }
        var listOwnerItems = contains(child.flags, 8 /* FLAGS.IS_LIST_OWNER */) ? [] : listItems;
        if (treatAsRealStackingContext || createsStackingContext) {
            var parentStack = treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;
            var stack = new StackingContext(paintContainer);
            if (child.styles.isPositioned() ||
                child.styles.opacity < 1 ||
                child.styles.isTransformed() ||
                child.styles.isFiltered() ||
                child.styles.mixBlendMode !== 0 /* MIX_BLEND_MODE.NORMAL */) {
                var order_1 = child.styles.zIndex.order;
                if (order_1 < 0) {
                    var index_1 = 0;
                    parentStack.negativeZIndex.some(function (current, i) {
                        if (order_1 > current.element.container.styles.zIndex.order) {
                            index_1 = i;
                            return false;
                        }
                        else if (index_1 > 0) {
                            return true;
                        }
                        return false;
                    });
                    parentStack.negativeZIndex.splice(index_1, 0, stack);
                }
                else if (order_1 > 0) {
                    var index_2 = 0;
                    parentStack.positiveZIndex.some(function (current, i) {
                        if (order_1 >= current.element.container.styles.zIndex.order) {
                            index_2 = i + 1;
                            return false;
                        }
                        else if (index_2 > 0) {
                            return true;
                        }
                        return false;
                    });
                    parentStack.positiveZIndex.splice(index_2, 0, stack);
                }
                else {
                    parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
                }
            }
            else {
                if (child.styles.isFloating()) {
                    parentStack.nonPositionedFloats.push(stack);
                }
                else {
                    parentStack.nonPositionedInlineLevel.push(stack);
                }
            }
            parseStackTree(paintContainer, stack, treatAsRealStackingContext ? stack : realStackingContext, listOwnerItems);
        }
        else {
            if (child.styles.isInlineLevel()) {
                stackingContext.inlineLevel.push(paintContainer);
            }
            else {
                stackingContext.nonInlineLevel.push(paintContainer);
            }
            parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
        }
        if (contains(child.flags, 8 /* FLAGS.IS_LIST_OWNER */)) {
            processListItems(child, listOwnerItems);
        }
    });
};
var processListItems = function (owner, elements) {
    var numbering = owner instanceof OLElementContainer ? owner.start : 1;
    var reversed = owner instanceof OLElementContainer ? owner.reversed : false;
    for (var i = 0; i < elements.length; i++) {
        var item = elements[i];
        if (item.container instanceof LIElementContainer &&
            typeof item.container.value === 'number' &&
            item.container.value !== 0) {
            numbering = item.container.value;
        }
        item.listValue = createCounterText(numbering, item.container.styles.listStyleType, true);
        numbering += reversed ? -1 : 1;
    }
};
var parseStackingContexts = function (container) {
    var paintContainer = new ElementPaint(container, null);
    var root = new StackingContext(paintContainer);
    var listItems = [];
    parseStackTree(paintContainer, root, root, listItems);
    processListItems(paintContainer.container, listItems);
    return root;
};

var CanvasRenderer = /** @class */ (function (_super) {
    __extends(CanvasRenderer, _super);
    function CanvasRenderer(context, options) {
        var _this = _super.call(this, context, options) || this;
        _this._activeEffects = [];
        _this._fontStyleCache = new WeakMap();
        _this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
        _this.ctx = _this.canvas.getContext('2d');
        if (!options.canvas) {
            _this.canvas.width = Math.floor(options.width * options.scale);
            _this.canvas.height = Math.floor(options.height * options.scale);
            _this.canvas.style.width = "".concat(options.width, "px");
            _this.canvas.style.height = "".concat(options.height, "px");
        }
        _this._isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
        _this.fontMetrics = new FontMetrics(document, _this._isFirefox ? 1 : 2);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _this._isChrome = !!window.chrome;
        _this.ctx.scale(_this.options.scale, _this.options.scale);
        _this.ctx.translate(-options.x, -options.y);
        _this.ctx.textBaseline = 'bottom';
        _this._activeEffects = [];
        _this.context.logger.debug("Canvas renderer initialized (".concat(options.width, "x").concat(options.height, ") with scale ").concat(options.scale));
        return _this;
    }
    CanvasRenderer.prototype.applyEffects = function (effects) {
        var _this = this;
        while (this._activeEffects.length) {
            this.popEffect();
        }
        effects.forEach(function (effect) { return _this.applyEffect(effect); });
    };
    CanvasRenderer.prototype.applyEffect = function (effect) {
        this.ctx.save();
        if (isOpacityEffect(effect)) {
            this.ctx.globalAlpha = effect.opacity;
        }
        if (isTransformEffect(effect)) {
            this.ctx.translate(effect.offsetX, effect.offsetY);
            this.ctx.transform(effect.matrix[0], effect.matrix[1], effect.matrix[2], effect.matrix[3], effect.matrix[4], effect.matrix[5]);
            this.ctx.translate(-effect.offsetX, -effect.offsetY);
        }
        if (isClipEffect(effect)) {
            this.path(effect.path);
            this.ctx.clip();
        }
        if (isFilterEffect(effect)) ;
        if (isMixBlendModeEffect(effect)) {
            this.ctx.globalCompositeOperation = mixBlendModeToComposite[effect.mixBlendMode];
        }
        this._activeEffects.push(effect);
    };
    CanvasRenderer.prototype.popEffect = function () {
        this._activeEffects.pop();
        this.ctx.restore();
    };
    CanvasRenderer.prototype.renderStack = function (stack) {
        return __awaiter(this, void 0, void 0, function () {
            var styles, offscreenFilters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        styles = stack.element.container.styles;
                        if (!styles.isVisible()) return [3 /*break*/, 4];
                        offscreenFilters = this._getOffscreenFilters(stack);
                        if (!offscreenFilters) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._renderStackWithOffscreenFilters(stack, offscreenFilters)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.renderStackContent(stack)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the ctx.filter string for all filters if the stacking context's own
     * effects include them, or null if there are none.
     * Offscreen rendering is needed because ctx.filter interacts badly with ctx.clip().
     */
    CanvasRenderer.prototype._getOffscreenFilters = function (stack) {
        var filterStrings = [];
        for (var _i = 0, _a = stack.element.effects; _i < _a.length; _i++) {
            var effect = _a[_i];
            if (isFilterEffect(effect)) {
                for (var _b = 0, _c = effect.filter; _b < _c.length; _b++) {
                    var f = _c[_b];
                    switch (f.type) {
                        case 0 /* FilterType.DROP_SHADOW */:
                            filterStrings.push("drop-shadow(".concat(f.offsetX.number, "px ").concat(f.offsetY.number, "px ").concat(f.blur.number, "px ").concat(asString(f.color), ")"));
                            break;
                        case 1 /* FilterType.BLUR */:
                            filterStrings.push("blur(".concat(f.radius.number, "px)"));
                            break;
                        case 2 /* FilterType.BRIGHTNESS */:
                            filterStrings.push("brightness(".concat(f.amount, ")"));
                            break;
                        case 3 /* FilterType.CONTRAST */:
                            filterStrings.push("contrast(".concat(f.amount, ")"));
                            break;
                        case 4 /* FilterType.GRAYSCALE */:
                            filterStrings.push("grayscale(".concat(f.amount, ")"));
                            break;
                        case 5 /* FilterType.HUE_ROTATE */:
                            filterStrings.push("hue-rotate(".concat(f.angle, "deg)"));
                            break;
                        case 6 /* FilterType.INVERT */:
                            filterStrings.push("invert(".concat(f.amount, ")"));
                            break;
                        case 7 /* FilterType.OPACITY */:
                            filterStrings.push("opacity(".concat(f.amount, ")"));
                            break;
                        case 8 /* FilterType.SATURATE */:
                            filterStrings.push("saturate(".concat(f.amount, ")"));
                            break;
                        case 9 /* FilterType.SEPIA */:
                            filterStrings.push("sepia(".concat(f.amount, ")"));
                            break;
                    }
                }
            }
        }
        return filterStrings.length > 0 ? filterStrings.join(' ') : null;
    };
    /**
     * Renders a stacking context into an offscreen canvas, then draws it onto the
     * main canvas with the drop-shadow/blur filter applied. This prevents the filter
     * from being clipped by the element's own clip region.
     */
    CanvasRenderer.prototype._renderStackWithOffscreenFilters = function (stack, filterString) {
        return __awaiter(this, void 0, void 0, function () {
            var mainCanvas, mainCtx, offscreen, offCtx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mainCanvas = this.canvas;
                        mainCtx = this.ctx;
                        offscreen = document.createElement('canvas');
                        offscreen.width = mainCanvas.width;
                        offscreen.height = mainCanvas.height;
                        offCtx = offscreen.getContext('2d');
                        offCtx.scale(this.options.scale, this.options.scale);
                        offCtx.translate(-this.options.x, -this.options.y);
                        offCtx.textBaseline = 'bottom';
                        // Swap to offscreen canvas
                        this.canvas = offscreen;
                        this.ctx = offCtx;
                        // Render the stacking context content normally (without drop-shadow/blur in effects)
                        return [4 /*yield*/, this.renderStackContent(stack)];
                    case 1:
                        // Render the stacking context content normally (without drop-shadow/blur in effects)
                        _a.sent();
                        // Restore main canvas
                        this.canvas = mainCanvas;
                        this.ctx = mainCtx;
                        // Draw offscreen canvas onto main canvas with the filter
                        this.ctx.save();
                        this.ctx.filter = filterString;
                        // Reset transform to identity since offscreen canvas is already at the correct scale/position
                        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                        this.ctx.drawImage(offscreen, 0, 0);
                        this.ctx.restore();
                        return [2 /*return*/];
                }
            });
        });
    };
    CanvasRenderer.prototype.renderNode = function (paint) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (contains(paint.container.flags, 16 /* FLAGS.DEBUG_RENDER */)) {
                            debugger;
                        }
                        if (!paint.container.styles.isVisible()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.renderNodeBackgroundAndBorders(paint)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.renderNodeContent(paint)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CanvasRenderer.prototype.renderTextWithLetterSpacing = function (text, letterSpacing, baseline, writingMode, useStroke) {
        var _this = this;
        if (writingMode === void 0) { writingMode = 0 /* WRITING_MODE.HORIZONTAL_TB */; }
        if (useStroke === void 0) { useStroke = false; }
        var isVertical = writingMode === 1 /* WRITING_MODE.VERTICAL_RL */ ||
            writingMode === 2 /* WRITING_MODE.VERTICAL_LR */ ||
            writingMode === 3 /* WRITING_MODE.SIDEWAYS_RL */ ||
            writingMode === 4 /* WRITING_MODE.SIDEWAYS_LR */;
        var drawText = useStroke
            ? function (t, x, y) { return _this.ctx.strokeText(t, x, y); }
            : function (t, x, y) { return _this.ctx.fillText(t, x, y); };
        if (isVertical) {
            // For vertical writing modes the browser already positions the text bounds correctly.
            // We rotate the canvas ±90° around the centre of the text bounds so that fillText
            // draws along the right axis, then restore.
            var isSidewaysLR = writingMode === 4 /* WRITING_MODE.SIDEWAYS_LR */;
            // sideways-lr rotates -90°; all other vertical modes rotate +90°
            var angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;
            var cx = text.bounds.left + text.bounds.width / 2;
            var cy = text.bounds.top + text.bounds.height / 2;
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.rotate(angle);
            this.ctx.translate(-cx, -cy);
            // After rotation the "visual" width and height swap, so we need to
            // paint as if the text was horizontal with swapped bounds.
            var rotatedBounds = new Bounds(cx - text.bounds.height / 2, cy - text.bounds.width / 2, text.bounds.height, text.bounds.width);
            var rotatedText_1 = new TextBounds(text.text, rotatedBounds);
            if (letterSpacing === 0) {
                if (!this._isFirefox) {
                    this.ctx.textBaseline = 'ideographic';
                    drawText(rotatedText_1.text, rotatedText_1.bounds.left, rotatedText_1.bounds.top + rotatedText_1.bounds.height);
                }
                else {
                    drawText(rotatedText_1.text, rotatedText_1.bounds.left, rotatedText_1.bounds.top + baseline);
                }
            }
            else {
                var letters_1 = segmentGraphemes(rotatedText_1.text);
                letters_1.reduce(function (left, letter, index) {
                    drawText(letter, left, rotatedText_1.bounds.top + baseline);
                    var isLast = index === letters_1.length - 1;
                    return left + _this.ctx.measureText(letter).width + (isLast ? 0 : letterSpacing - 1);
                }, rotatedText_1.bounds.left);
            }
            this.ctx.restore();
        }
        else {
            if (letterSpacing === 0) {
                // Fixed an issue with characters moving up in non-Firefox.
                // https://github.com/niklasvh/html2canvas/issues/2107#issuecomment-692462900
                if (!this._isFirefox) {
                    this.ctx.textBaseline = 'ideographic';
                    drawText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
                }
                else {
                    drawText(text.text, text.bounds.left, text.bounds.top + baseline);
                }
            }
            else {
                var letters_2 = segmentGraphemes(text.text);
                letters_2.reduce(function (left, letter, index) {
                    drawText(letter, left, text.bounds.top + baseline);
                    var isLast = index === letters_2.length - 1;
                    return left + _this.ctx.measureText(letter).width + (isLast ? 0 : letterSpacing - 1);
                }, text.bounds.left);
            }
        }
    };
    CanvasRenderer.prototype.createFontStyle = function (styles) {
        var cached = this._fontStyleCache.get(styles);
        if (cached) {
            return cached;
        }
        var fontVariant = styles.fontVariant
            .filter(function (variant) { return variant === 'normal' || variant === 'small-caps'; })
            .join('');
        var fontFamily = fixIOSSystemFonts(styles.fontFamily).join(', ');
        var fontSize = isDimensionToken(styles.fontSize)
            ? "".concat(getNumber(styles.fontSize)).concat(styles.fontSize.unit)
            : "".concat(getNumber(styles.fontSize), "px");
        var result = [
            [styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' '),
            fontFamily,
            fontSize,
        ];
        this._fontStyleCache.set(styles, result);
        return result;
    };
    /**
     * Draws a single text-decoration line segment using the given style.
     * For horizontal text:  x, y = top-left corner, w = length along text, h = line thickness.
     * For vertical text:    x, y = top-left corner, w = line thickness,   h = length along text.
     * The `isVertical` flag swaps the semantics of w/h for dotted/dashed segment sizing.
     */
    CanvasRenderer.prototype.renderDecorationLine = function (style, x, y, w, h, isVertical, textDecorationLine) {
        switch (style) {
            case 1 /* TEXT_DECORATION_STYLE.DOUBLE */: {
                // For double, `h` (or `w` in vertical) is the thickness of each individual line.
                // Gap between the two lines = max(1, round(thickness / 2)).
                if (isVertical) {
                    var lineW = Math.max(1, w);
                    var gap = Math.max(1, Math.round(w / 2));
                    this.ctx.fillRect(x, y, lineW, h);
                    if (textDecorationLine === 2 /* TEXT_DECORATION_LINE.OVERLINE */) {
                        this.ctx.fillRect(x - lineW - gap, y, lineW, h);
                    }
                    else {
                        this.ctx.fillRect(x + lineW + gap, y, lineW, h);
                    }
                }
                else {
                    var lineH = Math.max(1, h);
                    var gap = Math.max(1, Math.trunc(h / 2));
                    this.ctx.fillRect(x, y, w, lineH);
                    if (textDecorationLine === 2 /* TEXT_DECORATION_LINE.OVERLINE */) {
                        this.ctx.fillRect(x, y - lineH - gap, w, lineH);
                    }
                    else {
                        this.ctx.fillRect(x, y + lineH + gap, w, lineH);
                    }
                }
                break;
            }
            case 2 /* TEXT_DECORATION_STYLE.DOTTED */: {
                // Dots (squares) with diameter = thickness, spaced by one dot width.
                var dotSize = isVertical ? w : h;
                var length_1 = isVertical ? h : w;
                var step = dotSize * 2;
                for (var pos = 0; pos < length_1; pos += step) {
                    if (isVertical) {
                        this.ctx.fillRect(x, y + pos, w, Math.min(dotSize, length_1 - pos));
                    }
                    else {
                        this.ctx.fillRect(x + pos, y, Math.min(dotSize, length_1 - pos), h);
                    }
                }
                break;
            }
            case 3 /* TEXT_DECORATION_STYLE.DASHED */: {
                // Dashes 3× the thickness long, with a gap equal to the dash length.
                var thickness = isVertical ? w : h;
                var dashLen = thickness * 3;
                var length_2 = isVertical ? h : w;
                var step = dashLen * 2;
                for (var pos = 0; pos < length_2; pos += step) {
                    if (isVertical) {
                        this.ctx.fillRect(x, y + pos, w, Math.min(dashLen, length_2 - pos));
                    }
                    else {
                        this.ctx.fillRect(x + pos, y, Math.min(dashLen, length_2 - pos), h);
                    }
                }
                break;
            }
            case 0 /* TEXT_DECORATION_STYLE.SOLID */:
            case 4 /* TEXT_DECORATION_STYLE.WAVY */:
            default:
                // solid (and unimplemented wavy) fall back to a simple filled rectangle.
                this.ctx.fillRect(x, y, w, h);
                break;
        }
    };
    CanvasRenderer.prototype.renderTextNode = function (text, styles) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, font, fontFamily, fontSize, paintOrder, wm, isVertical, baseline;
            var _this = this;
            return __generator(this, function (_b) {
                _a = this.createFontStyle(styles), font = _a[0], fontFamily = _a[1], fontSize = _a[2];
                this.ctx.font = font;
                this.ctx.direction = styles.direction === 1 /* DIRECTION.RTL */ ? 'rtl' : 'ltr';
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'alphabetic';
                paintOrder = styles.paintOrder;
                wm = styles.writingMode;
                isVertical = wm === 1 /* WRITING_MODE.VERTICAL_RL */ ||
                    wm === 2 /* WRITING_MODE.VERTICAL_LR */ ||
                    wm === 3 /* WRITING_MODE.SIDEWAYS_RL */ ||
                    wm === 4 /* WRITING_MODE.SIDEWAYS_LR */;
                baseline = this.fontMetrics.getMetrics(fontFamily, fontSize).baseline;
                text.textBounds.forEach(function (text) {
                    paintOrder.forEach(function (paintOrderLayer) {
                        switch (paintOrderLayer) {
                            case 0 /* PAINT_ORDER_LAYER.FILL */:
                                // When background-clip: text is active, the text fill is handled
                                // by the background compositing — skip normal text rendering.
                                if (getBackgroundValueForIndex(styles.backgroundClip, 0) === 3 /* BACKGROUND_CLIP.TEXT */) {
                                    break;
                                }
                                _this.ctx.fillStyle = asString(styles.color);
                                var textShadows = styles.textShadow;
                                if (textShadows.length && text.text.trim().length) {
                                    // Render each shadow manually: draw the text in the shadow colour
                                    // at the shadow offset on an isolated offscreen canvas, then apply
                                    // a CSS blur filter before compositing onto the main canvas.
                                    // This bypasses the Canvas shadow API entirely, which cannot handle
                                    // transparent text or multiple independent blur radii.
                                    var w_1 = _this.canvas.width;
                                    var h_1 = _this.canvas.height;
                                    var scale_1 = _this.options.scale;
                                    var ox_1 = _this.options.x;
                                    var oy_1 = _this.options.y;
                                    textShadows
                                        .slice(0)
                                        .reverse()
                                        .forEach(function (textShadow) {
                                        var shadowCanvas = document.createElement('canvas');
                                        shadowCanvas.width = w_1;
                                        shadowCanvas.height = h_1;
                                        var shadowCtx = shadowCanvas.getContext('2d');
                                        shadowCtx.scale(scale_1, scale_1);
                                        // Incorporate the shadow offset into the translate so the
                                        // text is drawn at the correct position on the offscreen.
                                        shadowCtx.translate(-ox_1 + textShadow.offsetX.number, -oy_1 + textShadow.offsetY.number);
                                        shadowCtx.font = _this.ctx.font;
                                        shadowCtx.direction = _this.ctx.direction;
                                        shadowCtx.textAlign = _this.ctx.textAlign;
                                        shadowCtx.textBaseline = _this.ctx.textBaseline;
                                        shadowCtx.fillStyle = asString(textShadow.color);
                                        var mainCtx = _this.ctx;
                                        _this.ctx = shadowCtx;
                                        _this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, wm);
                                        _this.ctx = mainCtx;
                                        // Apply blur via ctx.filter on the main canvas drawImage call.
                                        if (textShadow.blur.number > 0) {
                                            _this.ctx.save();
                                            _this.ctx.filter = "blur(".concat(textShadow.blur.number / 2, "px)");
                                        }
                                        _this.ctx.drawImage(shadowCanvas, 0, 0, w_1, h_1, ox_1, oy_1, w_1 / scale_1, h_1 / scale_1);
                                        if (textShadow.blur.number > 0) {
                                            _this.ctx.restore();
                                        }
                                    });
                                    // Draw the real text on top of all shadows.
                                    // Skipped for transparent text — shadows are the only visual.
                                    if (!isTransparent(styles.color)) {
                                        _this.ctx.save();
                                        _this.ctx.fillStyle = asString(styles.color);
                                        _this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, wm);
                                        _this.ctx.restore();
                                    }
                                }
                                else if (!isTransparent(styles.color)) {
                                    _this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, wm);
                                }
                                if (styles.textDecorationLine.length) {
                                    _this.ctx.fillStyle = asString(isTransparent(styles.textDecorationColor) ? styles.color : styles.textDecorationColor);
                                    // Resolve line thickness: explicit value or 1px fallback for auto/from-font.
                                    var thickness_1 = typeof styles.textDecorationThickness === 'number' ? styles.textDecorationThickness : 1;
                                    styles.textDecorationLine.forEach(function (textDecorationLine) {
                                        if (isVertical) {
                                            var underlineOnLeft = wm === 2 /* WRITING_MODE.VERTICAL_LR */ || wm === 1 /* WRITING_MODE.VERTICAL_RL */;
                                            var lineX = void 0;
                                            switch (textDecorationLine) {
                                                case 1 /* TEXT_DECORATION_LINE.UNDERLINE */:
                                                    lineX = underlineOnLeft
                                                        ? text.bounds.left
                                                        : text.bounds.left + text.bounds.width - thickness_1;
                                                    break;
                                                case 2 /* TEXT_DECORATION_LINE.OVERLINE */:
                                                    lineX = underlineOnLeft
                                                        ? text.bounds.left + text.bounds.width - thickness_1
                                                        : text.bounds.left;
                                                    break;
                                                case 3 /* TEXT_DECORATION_LINE.LINE_THROUGH */:
                                                default:
                                                    lineX = text.bounds.left + text.bounds.width / 2 - thickness_1 / 2;
                                                    break;
                                            }
                                            _this.renderDecorationLine(styles.textDecorationStyle, lineX, text.bounds.top, thickness_1, text.bounds.height, true, textDecorationLine);
                                        }
                                        else {
                                            // baseline = distance from bounds.top to the alphabetic baseline.
                                            // Use it to position decorations relative to actual glyph positions
                                            // rather than the full line-height bounding box.
                                            var baselineY = text.bounds.top + baseline;
                                            var lineY = void 0;
                                            switch (textDecorationLine) {
                                                case 1 /* TEXT_DECORATION_LINE.UNDERLINE */:
                                                    lineY = baselineY + 2;
                                                    break;
                                                case 2 /* TEXT_DECORATION_LINE.OVERLINE */:
                                                    lineY = Math.round(text.bounds.top + (text.bounds.height - baseline) * 0.1);
                                                    break;
                                                case 3 /* TEXT_DECORATION_LINE.LINE_THROUGH */:
                                                default:
                                                    lineY = Math.round(baselineY - baseline * 0.4) + 2;
                                                    break;
                                            }
                                            _this.renderDecorationLine(styles.textDecorationStyle, text.bounds.left, lineY, text.bounds.width, thickness_1, false, textDecorationLine);
                                        }
                                    });
                                }
                                break;
                            case 1 /* PAINT_ORDER_LAYER.STROKE */:
                                if (styles.webkitTextStrokeWidth && text.text.trim().length) {
                                    _this.ctx.strokeStyle = asString(styles.webkitTextStrokeColor);
                                    _this.ctx.lineWidth = styles.webkitTextStrokeWidth;
                                    _this.ctx.lineJoin = _this._isChrome ? 'miter' : 'round';
                                    _this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, wm, true);
                                }
                                _this.ctx.strokeStyle = '';
                                _this.ctx.lineWidth = 0;
                                _this.ctx.lineJoin = 'miter';
                                break;
                        }
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    CanvasRenderer.prototype.renderReplacedElement = function (container, curves, image) {
        if (image) {
            var isContainerWSizes = container.intrinsicWidth > 0 && container.intrinsicHeight > 0;
            var isSVGContainer = container instanceof SVGElementContainer ||
                (container instanceof ImageElementContainer && container.isSVG);
            if (isContainerWSizes || isSVGContainer) {
                var box = contentBox(container);
                var path = calculatePaddingBoxPath(curves);
                this.path(path);
                var _a = calculateObjectFitBounds(container.styles.objectFit, container.intrinsicWidth, container.intrinsicHeight, box.width, box.height), src = _a.src, dest = _a.dest;
                this.ctx.save();
                this.ctx.clip();
                if (isContainerWSizes) {
                    this.ctx.drawImage(image, src.left, src.top, src.width, src.height, box.left + dest.left, box.top + dest.top, dest.width, dest.height);
                }
                else {
                    // As usual it won't work in FF. https://bugzilla.mozilla.org/show_bug.cgi?id=700533
                    this.ctx.drawImage(image, box.left, box.top, box.width, box.height);
                }
                this.ctx.restore();
            }
        }
    };
    CanvasRenderer.prototype.renderNodeContent = function (paint) {
        return __awaiter(this, void 0, void 0, function () {
            var container, curves, styles, _i, _a, child, image, e_1, image, image, iframeRenderer, canvas, size, bounds, ratio, isHorizontal, trackThickness, thumbRadius, trackY, trackLeft, trackWidth, thumbX, thumbY, trackX, trackTop, trackHeight, filledHeight, thumbX, thumbY, bounds, ratio, borderRadius, fillWidth, bounds, ratio, state, borderRadius, fillColor, fillWidth, _b, font, fontFamily, fontSize, baseline_1, bounds_1, fontSizeNumber, lineHeight_1, scrollTop_1, xOffset, originX_1, letterSpacing_1, measureWidth_1, wrapParagraph, paragraphs, wrappedLines, _c, paragraphs_1, paragraph, _d, _e, line, x, textBounds, img, image, url, fontFamily, wm, isVerticalList, fontSize, isSidewaysLR, angle, markerX, markerY, fontSize, isSidewaysLR, angle, markerX, markerY, _f, fontFamily_1, fontSize, baseline, lineHeight, leading, markerY;
            var _this = this;
            var _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        this.applyEffects(paint.getEffects(4 /* EffectTarget.CONTENT */));
                        container = paint.container;
                        curves = paint.curves;
                        styles = container.styles;
                        _i = 0, _a = container.textNodes;
                        _h.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        child = _a[_i];
                        return [4 /*yield*/, this.renderTextNode(child, styles)];
                    case 2:
                        _h.sent();
                        _h.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!(container instanceof ImageElementContainer)) return [3 /*break*/, 14];
                        _h.label = 5;
                    case 5:
                        _h.trys.push([5, 8, , 14]);
                        return [4 /*yield*/, this.context.cache.match(container.src)];
                    case 6:
                        image = _h.sent();
                        return [4 /*yield*/, container.setup(image)];
                    case 7:
                        _h.sent();
                        this.renderReplacedElement(container, curves, image);
                        return [3 /*break*/, 14];
                    case 8:
                        e_1 = _h.sent();
                        _h.label = 9;
                    case 9:
                        _h.trys.push([9, 12, , 13]);
                        if (!(this.context.cache.deleteImage(container.src) && e_1.type === 'error')) return [3 /*break*/, 11];
                        this.context.cache.addImage(container.src);
                        return [4 /*yield*/, this.context.cache.match(container.src)];
                    case 10:
                        image = _h.sent();
                        this.renderReplacedElement(container, curves, image);
                        _h.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        _h.sent();
                        this.context.logger.error("Error loading image ".concat(container.src));
                        return [3 /*break*/, 13];
                    case 13: return [3 /*break*/, 14];
                    case 14:
                        if (container instanceof CanvasElementContainer) {
                            this.renderReplacedElement(container, curves, container.canvas);
                        }
                        if (!(container instanceof SVGElementContainer)) return [3 /*break*/, 18];
                        _h.label = 15;
                    case 15:
                        _h.trys.push([15, 17, , 18]);
                        return [4 /*yield*/, this.context.cache.match(container.svg)];
                    case 16:
                        image = _h.sent();
                        this.renderReplacedElement(container, curves, image);
                        return [3 /*break*/, 18];
                    case 17:
                        _h.sent();
                        this.context.logger.error("Error loading svg ".concat(container.svg.substring(0, 255)));
                        return [3 /*break*/, 18];
                    case 18:
                        if (!(container instanceof IFrameElementContainer && container.tree)) return [3 /*break*/, 20];
                        iframeRenderer = new CanvasRenderer(this.context, {
                            scale: this.options.scale,
                            backgroundColor: container.backgroundColor,
                            x: 0,
                            y: 0,
                            width: container.width,
                            height: container.height,
                        });
                        return [4 /*yield*/, iframeRenderer.render(container.tree)];
                    case 19:
                        canvas = _h.sent();
                        if (container.width && container.height) {
                            this.ctx.drawImage(canvas, 0, 0, container.width, container.height, container.bounds.left, container.bounds.top, container.bounds.width, container.bounds.height);
                        }
                        _h.label = 20;
                    case 20:
                        if (container instanceof InputElementContainer) {
                            size = Math.min(container.bounds.width, container.bounds.height);
                            if (container.type === CHECKBOX) {
                                if (container.checked) {
                                    this.ctx.save();
                                    this.path([
                                        new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79),
                                        new Vector(container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549),
                                        new Vector(container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071),
                                        new Vector(container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649),
                                        new Vector(container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23),
                                        new Vector(container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085),
                                        new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79),
                                    ]);
                                    this.ctx.fillStyle = asString(INPUT_COLOR);
                                    this.ctx.fill();
                                    this.ctx.restore();
                                }
                            }
                            else if (container.type === RADIO) {
                                if (container.checked) {
                                    this.ctx.save();
                                    this.ctx.beginPath();
                                    this.ctx.arc(container.bounds.left + size / 2, container.bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
                                    this.ctx.fillStyle = asString(INPUT_COLOR);
                                    this.ctx.fill();
                                    this.ctx.restore();
                                }
                            }
                            else if (container.type === RANGE) {
                                bounds = container.bounds;
                                ratio = container.max > container.min
                                    ? (container.valueAsNumber - container.min) / (container.max - container.min)
                                    : 0;
                                isHorizontal = bounds.width >= bounds.height;
                                trackThickness = 4;
                                thumbRadius = Math.min(bounds.width, bounds.height) * 0.35;
                                this.ctx.save();
                                if (isHorizontal) {
                                    trackY = bounds.top + bounds.height / 2 - trackThickness / 2;
                                    trackLeft = bounds.left + thumbRadius;
                                    trackWidth = bounds.width - thumbRadius * 2;
                                    this.ctx.fillStyle = '#c0c0c0';
                                    this.ctx.fillRect(trackLeft, trackY, trackWidth, trackThickness);
                                    // Filled portion
                                    this.ctx.fillStyle = '#0075ff';
                                    this.ctx.fillRect(trackLeft, trackY, trackWidth * ratio, trackThickness);
                                    thumbX = trackLeft + trackWidth * ratio;
                                    thumbY = bounds.top + bounds.height / 2;
                                    this.ctx.beginPath();
                                    this.ctx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
                                    this.ctx.fillStyle = '#ffffff';
                                    this.ctx.fill();
                                    this.ctx.strokeStyle = '#0075ff';
                                    this.ctx.lineWidth = 2;
                                    this.ctx.stroke();
                                }
                                else {
                                    trackX = bounds.left + bounds.width / 2 - trackThickness / 2;
                                    trackTop = bounds.top + thumbRadius;
                                    trackHeight = bounds.height - thumbRadius * 2;
                                    this.ctx.fillStyle = '#c0c0c0';
                                    this.ctx.fillRect(trackX, trackTop, trackThickness, trackHeight);
                                    filledHeight = trackHeight * ratio;
                                    this.ctx.fillStyle = '#0075ff';
                                    this.ctx.fillRect(trackX, trackTop + trackHeight - filledHeight, trackThickness, filledHeight);
                                    thumbX = bounds.left + bounds.width / 2;
                                    thumbY = trackTop + trackHeight * (1 - ratio);
                                    this.ctx.beginPath();
                                    this.ctx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
                                    this.ctx.fillStyle = '#ffffff';
                                    this.ctx.fill();
                                    this.ctx.strokeStyle = '#0075ff';
                                    this.ctx.lineWidth = 2;
                                    this.ctx.stroke();
                                }
                                this.ctx.restore();
                            }
                        }
                        if (container instanceof ProgressElementContainer) {
                            bounds = container.bounds;
                            ratio = container.ratio;
                            borderRadius = Math.min(bounds.height / 2, 4);
                            this.ctx.save();
                            // Track background
                            this.ctx.beginPath();
                            this.ctx.roundRect(bounds.left, bounds.top, bounds.width, bounds.height, borderRadius);
                            this.ctx.fillStyle = '#e6e6e6';
                            this.ctx.fill();
                            // Filled bar
                            if (ratio > 0) {
                                fillWidth = bounds.width * ratio;
                                this.ctx.beginPath();
                                this.ctx.roundRect(bounds.left, bounds.top, fillWidth, bounds.height, borderRadius);
                                this.ctx.fillStyle = '#0075ff';
                                this.ctx.fill();
                            }
                            this.ctx.restore();
                        }
                        if (container instanceof MeterElementContainer) {
                            bounds = container.bounds;
                            ratio = container.ratio;
                            state = container.state;
                            borderRadius = Math.min(bounds.height / 2, 4);
                            fillColor = void 0;
                            switch (state) {
                                case 0 /* METER_STATE.OPTIMUM */:
                                    fillColor = '#30b030';
                                    break;
                                case 1 /* METER_STATE.SUBOPTIMUM */:
                                    fillColor = '#daa520';
                                    break;
                                case 2 /* METER_STATE.CRITICAL */:
                                default:
                                    fillColor = '#e04040';
                                    break;
                            }
                            this.ctx.save();
                            // Track background
                            this.ctx.beginPath();
                            this.ctx.roundRect(bounds.left, bounds.top, bounds.width, bounds.height, borderRadius);
                            this.ctx.fillStyle = '#e6e6e6';
                            this.ctx.fill();
                            // Filled bar
                            if (ratio > 0) {
                                fillWidth = bounds.width * ratio;
                                this.ctx.beginPath();
                                this.ctx.roundRect(bounds.left, bounds.top, fillWidth, bounds.height, borderRadius);
                                this.ctx.fillStyle = fillColor;
                                this.ctx.fill();
                            }
                            this.ctx.restore();
                        }
                        if (isTextInputElement(container) && container.value.length) {
                            _b = this.createFontStyle(styles), font = _b[0], fontFamily = _b[1], fontSize = _b[2];
                            baseline_1 = this.fontMetrics.getMetrics(fontFamily, fontSize).baseline;
                            this.ctx.font = font;
                            this.ctx.fillStyle = asString(styles.color);
                            this.ctx.textBaseline = 'alphabetic';
                            this.ctx.textAlign = canvasTextAlign(container.styles.textAlign);
                            bounds_1 = contentBox(container);
                            this.ctx.save();
                            this.path([
                                new Vector(bounds_1.left, bounds_1.top),
                                new Vector(bounds_1.left + bounds_1.width, bounds_1.top),
                                new Vector(bounds_1.left + bounds_1.width, bounds_1.top + bounds_1.height),
                                new Vector(bounds_1.left, bounds_1.top + bounds_1.height),
                            ]);
                            this.ctx.clip();
                            if (container instanceof TextareaElementContainer) {
                                fontSizeNumber = getNumber(styles.fontSize);
                                lineHeight_1 = computeLineHeight(styles.lineHeight, fontSizeNumber);
                                scrollTop_1 = (_g = container.scrollTop) !== null && _g !== void 0 ? _g : 0;
                                xOffset = 0;
                                switch (container.styles.textAlign) {
                                    case 1 /* TEXT_ALIGN.CENTER */:
                                        xOffset = bounds_1.width / 2;
                                        break;
                                    case 2 /* TEXT_ALIGN.RIGHT */:
                                        xOffset = bounds_1.width;
                                        break;
                                }
                                originX_1 = bounds_1.left + xOffset;
                                letterSpacing_1 = styles.letterSpacing;
                                measureWidth_1 = function (text) {
                                    if (letterSpacing_1 !== 0 && text.length > 0) {
                                        var graphemeCount = segmentGraphemes(text).length;
                                        // Measure the full string at once so that kerning between
                                        // character pairs is accounted for (ctx.measureText on a single
                                        // glyph misses kerning with its neighbours).  Then add
                                        // letter-spacing gaps: (n-1) gaps because the browser does not
                                        // count trailing letter-spacing in the wrap budget.
                                        var glyphsWidth = _this.ctx.measureText(text).width / _this.options.scale;
                                        return glyphsWidth + (letterSpacing_1 - 1) * (graphemeCount - 1);
                                    }
                                    return _this.ctx.measureText(text).width / _this.options.scale;
                                };
                                wrapParagraph = function (paragraph, maxWidth) {
                                    var _a, _b;
                                    var lines = [];
                                    // Helper: break a single unsplittable chunk character-by-character.
                                    var breakChunk = function (chunk) {
                                        var graphemes = segmentGraphemes(chunk);
                                        var current = '';
                                        for (var _i = 0, graphemes_1 = graphemes; _i < graphemes_1.length; _i++) {
                                            var g = graphemes_1[_i];
                                            var candidate = current + g;
                                            if (current.length > 0 && measureWidth_1(candidate) > maxWidth) {
                                                lines.push(current);
                                                current = g;
                                            }
                                            else {
                                                current = candidate;
                                            }
                                        }
                                        if (current.length > 0) {
                                            lines.push(current);
                                        }
                                    };
                                    // Tokenise on whitespace AND after hyphens so that hyphenated
                                    // compounds ("many-manymany") can break after the dash, matching
                                    // the browser's default line-breaking behaviour for textareas.
                                    var tokens = paragraph.split(/(\s+|(?<=-+))/);
                                    var currentLine = '';
                                    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
                                        var token = tokens_1[_i];
                                        if (token === '')
                                            continue;
                                        var candidate = currentLine + token;
                                        if (currentLine.length > 0 && measureWidth_1(candidate) > maxWidth) {
                                            // Flush the current line.
                                            lines.push(currentLine);
                                            var trimmed = token.trimStart();
                                            // If the token itself is wider than the box, break it
                                            // character by character rather than leaving it on one line.
                                            if (trimmed.length > 0 && measureWidth_1(trimmed) > maxWidth) {
                                                breakChunk(trimmed);
                                                currentLine = (_a = lines.pop()) !== null && _a !== void 0 ? _a : '';
                                            }
                                            else {
                                                currentLine = trimmed;
                                            }
                                        }
                                        else {
                                            // First token on a new line: if it alone exceeds the width,
                                            // break it character by character right away.
                                            if (currentLine.length === 0 && measureWidth_1(token.trimStart()) > maxWidth) {
                                                var trimmed = token.trimStart();
                                                breakChunk(trimmed);
                                                currentLine = (_b = lines.pop()) !== null && _b !== void 0 ? _b : '';
                                            }
                                            else {
                                                currentLine = candidate;
                                            }
                                        }
                                    }
                                    if (currentLine.length > 0) {
                                        lines.push(currentLine);
                                    }
                                    return lines;
                                };
                                paragraphs = container.value.split('\n');
                                wrappedLines = [];
                                for (_c = 0, paragraphs_1 = paragraphs; _c < paragraphs_1.length; _c++) {
                                    paragraph = paragraphs_1[_c];
                                    if (paragraph.length === 0) {
                                        // Preserve blank lines produced by consecutive newlines.
                                        wrappedLines.push('');
                                        continue;
                                    }
                                    for (_d = 0, _e = wrapParagraph(paragraph, bounds_1.width); _d < _e.length; _d++) {
                                        line = _e[_d];
                                        wrappedLines.push(line);
                                    }
                                }
                                // Render each wrapped line at the appropriate vertical position,
                                // accounting for scrollTop so only visible lines are painted.
                                wrappedLines.forEach(function (line, index) {
                                    var lineTop = index * lineHeight_1 - scrollTop_1;
                                    // Skip lines that are completely outside the content box.
                                    if (lineTop + lineHeight_1 < 0 || lineTop > bounds_1.height) {
                                        return;
                                    }
                                    var lineBounds = new Bounds(originX_1, bounds_1.top + lineTop, bounds_1.width, lineHeight_1);
                                    _this.renderTextWithLetterSpacing(new TextBounds(line, lineBounds), styles.letterSpacing, baseline_1);
                                });
                            }
                            else {
                                x = 0;
                                switch (container.styles.textAlign) {
                                    case 1 /* TEXT_ALIGN.CENTER */:
                                        x += bounds_1.width / 2;
                                        break;
                                    case 2 /* TEXT_ALIGN.RIGHT */:
                                        x += bounds_1.width;
                                        break;
                                }
                                textBounds = bounds_1.add(x, 0, 0, -bounds_1.height / 2 + 1);
                                this.renderTextWithLetterSpacing(new TextBounds(container.value, textBounds), styles.letterSpacing, baseline_1);
                            }
                            this.ctx.restore();
                            this.ctx.textBaseline = 'alphabetic';
                            this.ctx.textAlign = 'left';
                        }
                        if (!contains(container.styles.display, 2048 /* DISPLAY.LIST_ITEM */)) return [3 /*break*/, 26];
                        if (!(container.styles.listStyleImage !== null)) return [3 /*break*/, 25];
                        img = container.styles.listStyleImage;
                        if (!(img.type === 0 /* CSSImageType.URL */)) return [3 /*break*/, 24];
                        image = void 0;
                        url = img.url;
                        _h.label = 21;
                    case 21:
                        _h.trys.push([21, 23, , 24]);
                        return [4 /*yield*/, this.context.cache.match(url)];
                    case 22:
                        image = _h.sent();
                        this.ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
                        return [3 /*break*/, 24];
                    case 23:
                        _h.sent();
                        this.context.logger.error("Error loading list-style-image ".concat(url));
                        return [3 /*break*/, 24];
                    case 24: return [3 /*break*/, 26];
                    case 25:
                        if (paint.listValue && container.styles.listStyleType !== -1 /* LIST_STYLE_TYPE.NONE */) {
                            fontFamily = this.createFontStyle(styles)[0];
                            wm = styles.writingMode;
                            isVerticalList = wm === 1 /* WRITING_MODE.VERTICAL_RL */ ||
                                wm === 2 /* WRITING_MODE.VERTICAL_LR */ ||
                                wm === 3 /* WRITING_MODE.SIDEWAYS_RL */ ||
                                wm === 4 /* WRITING_MODE.SIDEWAYS_LR */;
                            this.ctx.font = fontFamily;
                            this.ctx.fillStyle = asString(styles.color);
                            if (isVerticalList && container.styles.listStylePosition === 1 /* LIST_STYLE_POSITION.OUTSIDE */) {
                                fontSize = getNumber(styles.fontSize);
                                isSidewaysLR = wm === 4 /* WRITING_MODE.SIDEWAYS_LR */;
                                angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;
                                markerX = container.bounds.left +
                                    getAbsoluteValue(container.styles.paddingLeft, container.bounds.width) +
                                    fontSize / 2;
                                markerY = void 0;
                                if (isSidewaysLR) {
                                    markerY = container.bounds.top + container.bounds.height + fontSize;
                                }
                                else {
                                    markerY = container.bounds.top - fontSize / 2;
                                }
                                this.ctx.save();
                                this.ctx.translate(markerX, markerY);
                                this.ctx.rotate(angle);
                                this.ctx.textBaseline = isSidewaysLR ? 'hanging' : 'alphabetic';
                                this.ctx.textAlign = 'center';
                                this.ctx.fillText(paint.listValue, 0, 0);
                                this.ctx.restore();
                            }
                            else if (isVerticalList && container.styles.listStylePosition === 0 /* LIST_STYLE_POSITION.INSIDE */) {
                                fontSize = getNumber(styles.fontSize);
                                isSidewaysLR = wm === 4 /* WRITING_MODE.SIDEWAYS_LR */;
                                angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;
                                markerX = container.bounds.left +
                                    getAbsoluteValue(container.styles.paddingLeft, container.bounds.width) +
                                    fontSize / 2;
                                markerY = void 0;
                                if (isSidewaysLR) {
                                    // sideways-lr: text goes bottom→top, so inline-start = bottom of content
                                    markerY =
                                        container.bounds.top +
                                            container.bounds.height -
                                            getAbsoluteValue(container.styles.paddingBottom, container.bounds.height) -
                                            fontSize / 2;
                                }
                                else {
                                    // vertical-rl/lr: text goes top→bottom, so inline-start = top of content
                                    markerY =
                                        container.bounds.top +
                                            getAbsoluteValue(container.styles.paddingTop, container.bounds.height) +
                                            fontSize / 2;
                                }
                                this.ctx.save();
                                this.ctx.translate(markerX, markerY);
                                this.ctx.rotate(angle);
                                this.ctx.textBaseline = isSidewaysLR ? 'hanging' : 'alphabetic';
                                this.ctx.textAlign = 'right';
                                this.ctx.fillText(paint.listValue, 0, 0);
                                this.ctx.restore();
                            }
                            else {
                                this.ctx.textBaseline = 'alphabetic';
                                this.ctx.textAlign = 'right';
                                _f = this.createFontStyle(styles), fontFamily_1 = _f[1], fontSize = _f[2];
                                baseline = this.fontMetrics.getRawMetrics(fontFamily_1, fontSize).baseline;
                                lineHeight = computeLineHeight(styles.lineHeight, getNumber(styles.fontSize));
                                leading = Math.max(0, lineHeight - getNumber(styles.fontSize));
                                markerY = Math.floor(container.bounds.top +
                                    getAbsoluteValue(container.styles.paddingTop, container.bounds.width) +
                                    leading / 2 +
                                    baseline) - (this._isFirefox ? 1 : 0);
                                this.ctx.fillText(paint.listValue, container.bounds.left, markerY);
                            }
                            this.ctx.textBaseline = 'bottom';
                            this.ctx.textAlign = 'left';
                        }
                        _h.label = 26;
                    case 26: return [2 /*return*/];
                }
            });
        });
    };
    CanvasRenderer.prototype.renderStackContent = function (stack) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, child, _b, _c, child, _d, _e, child, _f, _g, child, _h, _j, child, _k, _l, child, _m, _o, child;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        if (contains(stack.element.container.flags, 16 /* FLAGS.DEBUG_RENDER */)) {
                            debugger;
                        }
                        // https://www.w3.org/TR/css-position-3/#painting-order
                        // 1. the background and borders of the element forming the stacking context.
                        return [4 /*yield*/, this.renderNodeBackgroundAndBorders(stack.element)];
                    case 1:
                        // https://www.w3.org/TR/css-position-3/#painting-order
                        // 1. the background and borders of the element forming the stacking context.
                        _p.sent();
                        _i = 0, _a = stack.negativeZIndex;
                        _p.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        child = _a[_i];
                        return [4 /*yield*/, this.renderStack(child)];
                    case 3:
                        _p.sent();
                        _p.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
                    return [4 /*yield*/, this.renderNodeContent(stack.element)];
                    case 6:
                        // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
                        _p.sent();
                        _b = 0, _c = stack.nonInlineLevel;
                        _p.label = 7;
                    case 7:
                        if (!(_b < _c.length)) return [3 /*break*/, 10];
                        child = _c[_b];
                        return [4 /*yield*/, this.renderNode(child)];
                    case 8:
                        _p.sent();
                        _p.label = 9;
                    case 9:
                        _b++;
                        return [3 /*break*/, 7];
                    case 10:
                        _d = 0, _e = stack.nonPositionedFloats;
                        _p.label = 11;
                    case 11:
                        if (!(_d < _e.length)) return [3 /*break*/, 14];
                        child = _e[_d];
                        return [4 /*yield*/, this.renderStack(child)];
                    case 12:
                        _p.sent();
                        _p.label = 13;
                    case 13:
                        _d++;
                        return [3 /*break*/, 11];
                    case 14:
                        _f = 0, _g = stack.nonPositionedInlineLevel;
                        _p.label = 15;
                    case 15:
                        if (!(_f < _g.length)) return [3 /*break*/, 18];
                        child = _g[_f];
                        return [4 /*yield*/, this.renderStack(child)];
                    case 16:
                        _p.sent();
                        _p.label = 17;
                    case 17:
                        _f++;
                        return [3 /*break*/, 15];
                    case 18:
                        _h = 0, _j = stack.inlineLevel;
                        _p.label = 19;
                    case 19:
                        if (!(_h < _j.length)) return [3 /*break*/, 22];
                        child = _j[_h];
                        return [4 /*yield*/, this.renderNode(child)];
                    case 20:
                        _p.sent();
                        _p.label = 21;
                    case 21:
                        _h++;
                        return [3 /*break*/, 19];
                    case 22:
                        _k = 0, _l = stack.zeroOrAutoZIndexOrTransformedOrOpacity;
                        _p.label = 23;
                    case 23:
                        if (!(_k < _l.length)) return [3 /*break*/, 26];
                        child = _l[_k];
                        return [4 /*yield*/, this.renderStack(child)];
                    case 24:
                        _p.sent();
                        _p.label = 25;
                    case 25:
                        _k++;
                        return [3 /*break*/, 23];
                    case 26:
                        _m = 0, _o = stack.positiveZIndex;
                        _p.label = 27;
                    case 27:
                        if (!(_m < _o.length)) return [3 /*break*/, 30];
                        child = _o[_m];
                        return [4 /*yield*/, this.renderStack(child)];
                    case 28:
                        _p.sent();
                        _p.label = 29;
                    case 29:
                        _m++;
                        return [3 /*break*/, 27];
                    case 30: return [2 /*return*/];
                }
            });
        });
    };
    CanvasRenderer.prototype.mask = function (paths) {
        this.ctx.beginPath();
        this.ctx.save();
        // reset tranform to identity
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.canvas.width, 0);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(0, 0);
        this.ctx.restore();
        this.formatPath(reversePath(paths));
        this.ctx.closePath();
    };
    CanvasRenderer.prototype.path = function (paths) {
        this.ctx.beginPath();
        this.formatPath(paths);
        this.ctx.closePath();
    };
    CanvasRenderer.prototype.formatPath = function (paths) {
        var _this = this;
        paths.forEach(function (point, index) {
            var start = isBezierCurve(point) ? point.start : point;
            if (index === 0) {
                _this.ctx.moveTo(start.x, start.y);
            }
            else {
                _this.ctx.lineTo(start.x, start.y);
            }
            if (isBezierCurve(point)) {
                _this.ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);
            }
        });
    };
    CanvasRenderer.prototype.renderRepeat = function (path, pattern, offsetX, offsetY) {
        this.path(path);
        this.ctx.fillStyle = pattern;
        this.ctx.translate(offsetX, offsetY);
        this.ctx.fill();
        this.ctx.translate(-offsetX, -offsetY);
    };
    CanvasRenderer.prototype.resizeImage = function (image, width, height) {
        // Commented out to solve "Operation is insecure" on safari
        // if (image.width === width && image.height === height) {
        //     return image;
        // }
        var _a;
        var ownerDocument = (_a = this.canvas.ownerDocument) !== null && _a !== void 0 ? _a : document;
        var canvas = ownerDocument.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
        return canvas;
    };
    CanvasRenderer.prototype.renderBackgroundImage = function (container) {
        return __awaiter(this, void 0, void 0, function () {
            var index, _loop_1, this_1, _i, _a, backgroundImage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        index = container.styles.backgroundImage.length - 1;
                        _loop_1 = function (backgroundImage) {
                            var blendMode, image, url, _c, path, x, y, width, height, pattern, _d, path, x, y, width, height, _e, lineLength, x0, x1, y0, y1, canvas, ctx, gradient_1, pattern, _f, path, left, top_1, width, height, position, x, y, _g, rx, ry, radialGradient_1, midX, midY, f, invF;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        blendMode = getBackgroundValueForIndex(container.styles.backgroundBlendMode, index);
                                        if (!(backgroundImage.type === 0 /* CSSImageType.URL */)) return [3 /*break*/, 5];
                                        image = void 0;
                                        url = backgroundImage.url;
                                        _h.label = 1;
                                    case 1:
                                        _h.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, this_1.context.cache.match(url)];
                                    case 2:
                                        image = _h.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _h.sent();
                                        this_1.context.logger.error("Error loading background-image ".concat(url));
                                        return [3 /*break*/, 4];
                                    case 4:
                                        if (image && image.width > 0 && image.height > 0) {
                                            _c = calculateBackgroundRendering(container, index, [
                                                image.width,
                                                image.height,
                                                image.width / image.height,
                                            ]), path = _c[0], x = _c[1], y = _c[2], width = _c[3], height = _c[4];
                                            pattern = this_1.ctx.createPattern(this_1.resizeImage(image, width, height), 'repeat');
                                            this_1.renderRepeat(path, pattern, x, y);
                                        }
                                        return [3 /*break*/, 6];
                                    case 5:
                                        if (isLinearGradient(backgroundImage)) {
                                            _d = calculateBackgroundRendering(container, index, [null, null, null]), path = _d[0], x = _d[1], y = _d[2], width = _d[3], height = _d[4];
                                            _e = calculateGradientDirection(backgroundImage.angle, width, height), lineLength = _e[0], x0 = _e[1], x1 = _e[2], y0 = _e[3], y1 = _e[4];
                                            canvas = document.createElement('canvas');
                                            canvas.width = Math.max(1, width);
                                            canvas.height = Math.max(1, height);
                                            ctx = canvas.getContext('2d');
                                            gradient_1 = ctx.createLinearGradient(x0, y0, x1, y1);
                                            processColorStops(backgroundImage.stops, lineLength || 1).forEach(function (colorStop) {
                                                return gradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                                            });
                                            ctx.fillStyle = gradient_1;
                                            ctx.fillRect(0, 0, width, height);
                                            if (width > 0 && height > 0) {
                                                pattern = this_1.ctx.createPattern(canvas, 'repeat');
                                                this_1.renderRepeat(path, pattern, x, y);
                                            }
                                        }
                                        else if (isRadialGradient(backgroundImage)) {
                                            _f = calculateBackgroundRendering(container, index, [
                                                null,
                                                null,
                                                null,
                                            ]), path = _f[0], left = _f[1], top_1 = _f[2], width = _f[3], height = _f[4];
                                            position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                                            x = getAbsoluteValue(position[0], width);
                                            y = getAbsoluteValue(position[position.length - 1], height);
                                            _g = calculateRadius(backgroundImage, x, y, width, height), rx = _g[0], ry = _g[1];
                                            if (rx > 0 && ry > 0) {
                                                radialGradient_1 = this_1.ctx.createRadialGradient(left + x, top_1 + y, 0, left + x, top_1 + y, rx);
                                                processColorStops(backgroundImage.stops, rx * 2).forEach(function (colorStop) {
                                                    return radialGradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                                                });
                                                this_1.path(path);
                                                this_1.ctx.fillStyle = radialGradient_1;
                                                if (rx !== ry) {
                                                    midX = container.bounds.left + 0.5 * container.bounds.width;
                                                    midY = container.bounds.top + 0.5 * container.bounds.height;
                                                    f = ry / rx;
                                                    invF = 1 / f;
                                                    this_1.ctx.save();
                                                    this_1.ctx.translate(midX, midY);
                                                    this_1.ctx.transform(1, 0, 0, f, 0, 0);
                                                    this_1.ctx.translate(-midX, -midY);
                                                    this_1.ctx.fillRect(left, invF * (top_1 - midY) + midY, width, height * invF);
                                                    this_1.ctx.restore();
                                                }
                                                else {
                                                    this_1.ctx.fill();
                                                }
                                            }
                                        }
                                        _h.label = 6;
                                    case 6:
                                        index--;
                                        if (blendMode !== 'source-over') {
                                            this_1.ctx.globalCompositeOperation = 'source-over';
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = container.styles.backgroundImage.slice(0).reverse();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        backgroundImage = _a[_i];
                        return [5 /*yield**/, _loop_1(backgroundImage)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CanvasRenderer.prototype.renderSolidBorder = function (color, side, curvePoints) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.path(parsePathForBorder(curvePoints, side));
                this.ctx.fillStyle = asString(color);
                this.ctx.fill();
                return [2 /*return*/];
            });
        });
    };
    CanvasRenderer.prototype.renderDoubleBorder = function (color, width, side, curvePoints) {
        return __awaiter(this, void 0, void 0, function () {
            var outerPaths, innerPaths;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(width < 3)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.renderSolidBorder(color, side, curvePoints)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        outerPaths = parsePathForBorderDoubleOuter(curvePoints, side);
                        this.path(outerPaths);
                        this.ctx.fillStyle = asString(color);
                        this.ctx.fill();
                        innerPaths = parsePathForBorderDoubleInner(curvePoints, side);
                        this.path(innerPaths);
                        this.ctx.fill();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Renders background clipped to text shapes using an offscreen canvas.
     * Steps:
     * 1. Create an offscreen canvas the size of the element's border box.
     * 2. Draw the background (color + images) normally onto the offscreen canvas.
     * 3. Create a text mask canvas with all text shapes drawn as opaque black.
     * 4. Apply 'destination-in' with the mask canvas to clip the background to text.
     * 5. Composite the offscreen canvas back onto the main canvas.
     */
    CanvasRenderer.prototype.renderBackgroundClipText = function (paint) {
        return __awaiter(this, void 0, void 0, function () {
            var container, styles, bounds, width, height, offscreen, offCtx, mainCtx, maskCanvas, maskCtx, _a, font, fontFamily, fontSize, wm, baseline, isVertical, _i, _b, textNode, _loop_2, this_2, _c, _d, textBound;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        container = paint.container;
                        styles = container.styles;
                        bounds = container.bounds;
                        if (container.textNodes.length === 0) {
                            return [2 /*return*/];
                        }
                        width = Math.ceil(bounds.width * this.options.scale);
                        height = Math.ceil(bounds.height * this.options.scale);
                        if (width <= 0 || height <= 0) {
                            return [2 /*return*/];
                        }
                        offscreen = document.createElement('canvas');
                        offscreen.width = width;
                        offscreen.height = height;
                        offCtx = offscreen.getContext('2d');
                        // Apply the same transform so absolute coordinates work correctly.
                        offCtx.scale(this.options.scale, this.options.scale);
                        offCtx.translate(-bounds.left, -bounds.top);
                        mainCtx = this.ctx;
                        this.ctx = offCtx;
                        if (!isTransparent(styles.backgroundColor)) {
                            this.ctx.fillStyle = asString(styles.backgroundColor);
                            this.ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);
                        }
                        return [4 /*yield*/, this.renderBackgroundImage(container)];
                    case 1:
                        _e.sent();
                        this.ctx = mainCtx;
                        maskCanvas = document.createElement('canvas');
                        maskCanvas.width = width;
                        maskCanvas.height = height;
                        maskCtx = maskCanvas.getContext('2d');
                        maskCtx.scale(this.options.scale, this.options.scale);
                        maskCtx.translate(-bounds.left, -bounds.top);
                        _a = this.createFontStyle(styles), font = _a[0], fontFamily = _a[1], fontSize = _a[2];
                        maskCtx.font = font;
                        maskCtx.direction = styles.direction === 1 /* DIRECTION.RTL */ ? 'rtl' : 'ltr';
                        maskCtx.textAlign = 'left';
                        maskCtx.fillStyle = '#000000';
                        wm = styles.writingMode;
                        baseline = this.fontMetrics.getMetrics(fontFamily, fontSize).baseline;
                        isVertical = wm === 1 /* WRITING_MODE.VERTICAL_RL */ ||
                            wm === 2 /* WRITING_MODE.VERTICAL_LR */ ||
                            wm === 3 /* WRITING_MODE.SIDEWAYS_RL */ ||
                            wm === 4 /* WRITING_MODE.SIDEWAYS_LR */;
                        for (_i = 0, _b = container.textNodes; _i < _b.length; _i++) {
                            textNode = _b[_i];
                            _loop_2 = function (textBound) {
                                if (isVertical) {
                                    var cx = textBound.bounds.left + textBound.bounds.width / 2;
                                    var cy = textBound.bounds.top + textBound.bounds.height / 2;
                                    var isSidewaysLR = wm === 4 /* WRITING_MODE.SIDEWAYS_LR */;
                                    var angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;
                                    maskCtx.save();
                                    maskCtx.translate(cx, cy);
                                    maskCtx.rotate(angle);
                                    maskCtx.translate(-cx, -cy);
                                    var rotatedBounds = new Bounds(cx - textBound.bounds.height / 2, cy - textBound.bounds.width / 2, textBound.bounds.height, textBound.bounds.width);
                                    if (!this_2._isFirefox) {
                                        maskCtx.textBaseline = 'ideographic';
                                        maskCtx.fillText(textBound.text, rotatedBounds.left, rotatedBounds.top + rotatedBounds.height);
                                    }
                                    else {
                                        maskCtx.textBaseline = 'alphabetic';
                                        maskCtx.fillText(textBound.text, rotatedBounds.left, rotatedBounds.top + baseline);
                                    }
                                    maskCtx.restore();
                                }
                                else {
                                    if (styles.letterSpacing === 0) {
                                        if (!this_2._isFirefox) {
                                            maskCtx.textBaseline = 'ideographic';
                                            maskCtx.fillText(textBound.text, textBound.bounds.left, textBound.bounds.top + textBound.bounds.height);
                                        }
                                        else {
                                            maskCtx.textBaseline = 'alphabetic';
                                            maskCtx.fillText(textBound.text, textBound.bounds.left, textBound.bounds.top + baseline);
                                        }
                                    }
                                    else {
                                        maskCtx.textBaseline = 'alphabetic';
                                        var letters_3 = segmentGraphemes(textBound.text);
                                        letters_3.reduce(function (left, letter, index) {
                                            maskCtx.fillText(letter, left, textBound.bounds.top + baseline);
                                            var isLast = index === letters_3.length - 1;
                                            return left + maskCtx.measureText(letter).width + (isLast ? 0 : styles.letterSpacing - 1);
                                        }, textBound.bounds.left);
                                    }
                                }
                            };
                            this_2 = this;
                            for (_c = 0, _d = textNode.textBounds; _c < _d.length; _c++) {
                                textBound = _d[_c];
                                _loop_2(textBound);
                            }
                        }
                        // Step 3: Apply the text mask to the background using 'destination-in'.
                        // This is a single drawImage call so it clips the entire background at once.
                        offCtx.globalCompositeOperation = 'destination-in';
                        offCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for pixel-to-pixel copy
                        offCtx.drawImage(maskCanvas, 0, 0);
                        // Step 4: Draw the clipped result onto the main canvas
                        this.ctx.drawImage(offscreen, 0, 0, width, height, bounds.left, bounds.top, bounds.width, bounds.height);
                        return [2 /*return*/];
                }
            });
        });
    };
    CanvasRenderer.prototype.renderNodeBackgroundAndBorders = function (paint) {
        return __awaiter(this, void 0, void 0, function () {
            var styles, hasBackground, borders, backgroundPaintingArea, isBackgroundClipText, _i, _a, textNode, _b, _c, textBound, side, _d, borders_1, border;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.applyEffects(paint.getEffects(2 /* EffectTarget.BACKGROUND_BORDERS */));
                        styles = paint.container.styles;
                        hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;
                        borders = [
                            { style: styles.borderTopStyle, color: styles.borderTopColor, width: styles.borderTopWidth },
                            { style: styles.borderRightStyle, color: styles.borderRightColor, width: styles.borderRightWidth },
                            { style: styles.borderBottomStyle, color: styles.borderBottomColor, width: styles.borderBottomWidth },
                            { style: styles.borderLeftStyle, color: styles.borderLeftColor, width: styles.borderLeftWidth },
                        ];
                        backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(getBackgroundValueForIndex(styles.backgroundClip, 0), paint.curves);
                        if (!(hasBackground || styles.boxShadow.length)) return [3 /*break*/, 5];
                        isBackgroundClipText = getBackgroundValueForIndex(styles.backgroundClip, 0) === 3 /* BACKGROUND_CLIP.TEXT */;
                        if (!(isBackgroundClipText && hasBackground)) return [3 /*break*/, 2];
                        // background-clip: text — render background clipped to text shapes
                        // using an offscreen canvas with composite operations.
                        return [4 /*yield*/, this.renderBackgroundClipText(paint)];
                    case 1:
                        // background-clip: text — render background clipped to text shapes
                        // using an offscreen canvas with composite operations.
                        _e.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!hasBackground) return [3 /*break*/, 4];
                        this.ctx.save();
                        this.path(backgroundPaintingArea);
                        this.ctx.clip();
                        if (!isTransparent(styles.backgroundColor)) {
                            this.ctx.fillStyle = asString(styles.backgroundColor);
                            if (styles.display === 4 /* DISPLAY.INLINE */) {
                                for (_i = 0, _a = paint.container.textNodes; _i < _a.length; _i++) {
                                    textNode = _a[_i];
                                    for (_b = 0, _c = textNode.textBounds; _b < _c.length; _b++) {
                                        textBound = _c[_b];
                                        this.ctx.fillRect(textBound.bounds.left, textBound.bounds.top, textBound.bounds.width, textBound.bounds.height);
                                    }
                                }
                            }
                            else {
                                this.ctx.fill();
                            }
                        }
                        return [4 /*yield*/, this.renderBackgroundImage(paint.container)];
                    case 3:
                        _e.sent();
                        this.ctx.restore();
                        _e.label = 4;
                    case 4:
                        styles.boxShadow
                            .slice(0)
                            .reverse()
                            .forEach(function (shadow) {
                            _this.ctx.save();
                            var borderBoxArea = calculateBorderBoxPath(paint.curves);
                            // Build the painting area by applying offset and spread.
                            // expandBorderBoxPath rebuilds the Bézier curves with adjusted radii
                            // (border-radius ± spread) per the CSS spec, unlike transformPath which
                            // only translates corners without updating the curve geometry.
                            // ctx.filter = blur() is the sole blur mechanism, avoiding the double-blur
                            // that occurred when both ctx.shadowBlur and ctx.filter were set simultaneously.
                            // See https://github.com/html2canvas/html2canvas/issues/21
                            var effectiveSpread = shadow.inset ? -shadow.spread.number : shadow.spread.number;
                            var shadowPaintingArea = expandBorderBoxPath(paint.curves, effectiveSpread).map(function (p) {
                                return p.add(shadow.offsetX.number, shadow.offsetY.number);
                            });
                            if (shadow.inset) {
                                _this.path(borderBoxArea);
                                _this.ctx.clip();
                                _this.mask(shadowPaintingArea);
                            }
                            else {
                                _this.mask(borderBoxArea);
                                _this.ctx.clip();
                                _this.path(shadowPaintingArea);
                            }
                            _this.ctx.fillStyle = asString(shadow.color);
                            if (shadow.blur.number) {
                                _this.ctx.filter = "blur(".concat(shadow.blur.number / 2, "px)");
                            }
                            _this.ctx.fill();
                            _this.ctx.restore();
                        });
                        _e.label = 5;
                    case 5:
                        side = 0;
                        _d = 0, borders_1 = borders;
                        _e.label = 6;
                    case 6:
                        if (!(_d < borders_1.length)) return [3 /*break*/, 16];
                        border = borders_1[_d];
                        if (!(border.style !== 0 /* BORDER_STYLE.NONE */ && !isTransparent(border.color) && border.width > 0)) return [3 /*break*/, 14];
                        if (!(border.style === 2 /* BORDER_STYLE.DASHED */)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.renderDashedDottedBorder(border.color, border.width, side, paint.curves, 2 /* BORDER_STYLE.DASHED */)];
                    case 7:
                        _e.sent();
                        return [3 /*break*/, 14];
                    case 8:
                        if (!(border.style === 3 /* BORDER_STYLE.DOTTED */)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.renderDashedDottedBorder(border.color, border.width, side, paint.curves, 3 /* BORDER_STYLE.DOTTED */)];
                    case 9:
                        _e.sent();
                        return [3 /*break*/, 14];
                    case 10:
                        if (!(border.style === 4 /* BORDER_STYLE.DOUBLE */)) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.renderDoubleBorder(border.color, border.width, side, paint.curves)];
                    case 11:
                        _e.sent();
                        return [3 /*break*/, 14];
                    case 12: return [4 /*yield*/, this.renderSolidBorder(border.color, side, paint.curves)];
                    case 13:
                        _e.sent();
                        _e.label = 14;
                    case 14:
                        side++;
                        _e.label = 15;
                    case 15:
                        _d++;
                        return [3 /*break*/, 6];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    CanvasRenderer.prototype.renderDashedDottedBorder = function (color, width, side, curvePoints, style) {
        return __awaiter(this, void 0, void 0, function () {
            var strokePaths, boxPaths, startX, startY, endX, endY, length, dashLength, spaceLength, useLineDash, multiplier, numberOfDashes, minSpace, maxSpace, path1, path2, path1, path2;
            return __generator(this, function (_a) {
                this.ctx.save();
                strokePaths = parsePathForBorderStroke(curvePoints, side);
                boxPaths = parsePathForBorder(curvePoints, side);
                if (style === 2 /* BORDER_STYLE.DASHED */) {
                    this.path(boxPaths);
                    this.ctx.clip();
                }
                if (isBezierCurve(boxPaths[0])) {
                    startX = boxPaths[0].start.x;
                    startY = boxPaths[0].start.y;
                }
                else {
                    startX = boxPaths[0].x;
                    startY = boxPaths[0].y;
                }
                if (isBezierCurve(boxPaths[1])) {
                    endX = boxPaths[1].end.x;
                    endY = boxPaths[1].end.y;
                }
                else {
                    endX = boxPaths[1].x;
                    endY = boxPaths[1].y;
                }
                if (side === 0 || side === 2) {
                    length = Math.abs(startX - endX);
                }
                else {
                    length = Math.abs(startY - endY);
                }
                this.ctx.beginPath();
                if (style === 3 /* BORDER_STYLE.DOTTED */) {
                    this.formatPath(strokePaths);
                }
                else {
                    this.formatPath(boxPaths.slice(0, 2));
                }
                dashLength = width < 3 ? width * 3 : width * 2;
                spaceLength = width < 3 ? width * 2 : width;
                if (style === 3 /* BORDER_STYLE.DOTTED */) {
                    dashLength = width;
                    spaceLength = width;
                }
                useLineDash = true;
                if (length <= dashLength * 2) {
                    useLineDash = false;
                }
                else if (length <= dashLength * 2 + spaceLength) {
                    multiplier = length / (2 * dashLength + spaceLength);
                    dashLength *= multiplier;
                    spaceLength *= multiplier;
                }
                else {
                    numberOfDashes = Math.floor((length + spaceLength) / (dashLength + spaceLength));
                    minSpace = (length - numberOfDashes * dashLength) / (numberOfDashes - 1);
                    maxSpace = (length - (numberOfDashes + 1) * dashLength) / numberOfDashes;
                    spaceLength =
                        maxSpace <= 0 || Math.abs(spaceLength - minSpace) < Math.abs(spaceLength - maxSpace)
                            ? minSpace
                            : maxSpace;
                }
                if (useLineDash) {
                    if (style === 3 /* BORDER_STYLE.DOTTED */) {
                        this.ctx.setLineDash([0, dashLength + spaceLength]);
                    }
                    else {
                        this.ctx.setLineDash([dashLength, spaceLength]);
                    }
                }
                if (style === 3 /* BORDER_STYLE.DOTTED */) {
                    this.ctx.lineCap = 'round';
                    this.ctx.lineWidth = width;
                }
                else {
                    this.ctx.lineWidth = width * 2 + 1.1;
                }
                this.ctx.strokeStyle = asString(color);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                // dashed round edge gap
                if (style === 2 /* BORDER_STYLE.DASHED */) {
                    if (isBezierCurve(boxPaths[0])) {
                        path1 = boxPaths[3];
                        path2 = boxPaths[0];
                        this.ctx.beginPath();
                        this.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
                        this.ctx.stroke();
                    }
                    if (isBezierCurve(boxPaths[1])) {
                        path1 = boxPaths[1];
                        path2 = boxPaths[2];
                        this.ctx.beginPath();
                        this.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
                        this.ctx.stroke();
                    }
                }
                this.ctx.restore();
                return [2 /*return*/];
            });
        });
    };
    CanvasRenderer.prototype.render = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            var stack;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.options.backgroundColor) {
                            this.ctx.fillStyle = asString(this.options.backgroundColor);
                            this.ctx.fillRect(this.options.x, this.options.y, this.options.width, this.options.height);
                        }
                        stack = parseStackingContexts(element);
                        return [4 /*yield*/, this.renderStack(stack)];
                    case 1:
                        _a.sent();
                        this.applyEffects([]);
                        return [2 /*return*/, this.canvas];
                }
            });
        });
    };
    return CanvasRenderer;
}(Renderer));
var isTextInputElement = function (container) {
    if (container instanceof TextareaElementContainer) {
        return true;
    }
    else if (container instanceof SelectElementContainer) {
        return true;
    }
    else if (container instanceof InputElementContainer &&
        container.type !== RADIO &&
        container.type !== CHECKBOX &&
        container.type !== RANGE) {
        return true;
    }
    return false;
};
var calculateBackgroundCurvedPaintingArea = function (clip, curves) {
    switch (clip) {
        case 0 /* BACKGROUND_CLIP.BORDER_BOX */:
            return calculateBorderBoxPath(curves);
        case 2 /* BACKGROUND_CLIP.CONTENT_BOX */:
            return calculateContentBoxPath(curves);
        case 3 /* BACKGROUND_CLIP.TEXT */:
            // For background-clip: text, use padding-box as the initial painting area.
            // The actual text-shape clipping is handled in renderNodeBackgroundAndBorders
            // via offscreen canvas compositing.
            return calculatePaddingBoxPath(curves);
        case 1 /* BACKGROUND_CLIP.PADDING_BOX */:
        default:
            return calculatePaddingBoxPath(curves);
    }
};
var canvasTextAlign = function (textAlign) {
    switch (textAlign) {
        case 1 /* TEXT_ALIGN.CENTER */:
            return 'center';
        case 2 /* TEXT_ALIGN.RIGHT */:
            return 'right';
        case 0 /* TEXT_ALIGN.LEFT */:
        default:
            return 'left';
    }
};
// see https://github.com/niklasvh/html2canvas/pull/2645
var iOSBrokenFonts = ['-apple-system', 'system-ui'];
var fixIOSSystemFonts = function (fontFamilies) {
    return /iPhone OS 15_(0|1)/.test(window.navigator.userAgent)
        ? fontFamilies.filter(function (fontFamily) { return iOSBrokenFonts.indexOf(fontFamily) === -1; })
        : fontFamilies;
};

var ForeignObjectRenderer = /** @class */ (function (_super) {
    __extends(ForeignObjectRenderer, _super);
    function ForeignObjectRenderer(context, options) {
        var _this = _super.call(this, context, options) || this;
        _this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
        _this.ctx = _this.canvas.getContext('2d');
        _this.options = options;
        _this.canvas.width = Math.floor(options.width * options.scale);
        _this.canvas.height = Math.floor(options.height * options.scale);
        _this.canvas.style.width = "".concat(options.width, "px");
        _this.canvas.style.height = "".concat(options.height, "px");
        _this.ctx.scale(_this.options.scale, _this.options.scale);
        _this.ctx.translate(-options.x, -options.y);
        _this.context.logger.debug("EXPERIMENTAL ForeignObject renderer initialized (".concat(options.width, "x").concat(options.height, " at ").concat(options.x, ",").concat(options.y, ") with scale ").concat(options.scale));
        return _this;
    }
    ForeignObjectRenderer.prototype.render = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            var svg, img;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        svg = createForeignObjectSVG(this.options.width * this.options.scale, this.options.height * this.options.scale, this.options.scale, this.options.scale, element);
                        return [4 /*yield*/, loadSerializedSVG(svg)];
                    case 1:
                        img = _a.sent();
                        if (this.options.backgroundColor) {
                            this.ctx.fillStyle = asString(this.options.backgroundColor);
                            this.ctx.fillRect(0, 0, this.options.width * this.options.scale, this.options.height * this.options.scale);
                        }
                        this.ctx.drawImage(img, -this.options.x * this.options.scale, -this.options.y * this.options.scale);
                        return [2 /*return*/, this.canvas];
                }
            });
        });
    };
    return ForeignObjectRenderer;
}(Renderer));

var html2canvas = function (element, options) {
    if (options === void 0) { options = {}; }
    return renderElement(element, options);
};
if (typeof window !== 'undefined') {
    CacheStorage.setContext(window);
}
var renderElement = function (element, opts) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerDocument, defaultView, resourceOptions, contextOptions, windowOptions, windowBounds, context, foreignObjectRendering, cloneOptions, documentCloner, clonedElement, container, _a, width, height, left, top, backgroundColor, renderOptions, canvas, renderer, root, renderer;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    return __generator(this, function (_u) {
        switch (_u.label) {
            case 0:
                if (!element || typeof element !== 'object') {
                    return [2 /*return*/, Promise.reject('Invalid element provided as first argument')];
                }
                ownerDocument = element.ownerDocument;
                if (!ownerDocument) {
                    throw new Error("Element is not attached to a Document");
                }
                defaultView = ownerDocument.defaultView;
                if (!defaultView) {
                    throw new Error("Document is not attached to a Window");
                }
                resourceOptions = {
                    allowTaint: (_b = opts.allowTaint) !== null && _b !== void 0 ? _b : false,
                    imageTimeout: (_c = opts.imageTimeout) !== null && _c !== void 0 ? _c : 15000,
                    proxy: opts.proxy,
                    useCORS: (_d = opts.useCORS) !== null && _d !== void 0 ? _d : false,
                };
                contextOptions = __assign({ logging: (_e = opts.logging) !== null && _e !== void 0 ? _e : true, cache: opts.cache }, resourceOptions);
                windowOptions = {
                    windowWidth: (_f = opts.windowWidth) !== null && _f !== void 0 ? _f : defaultView.innerWidth,
                    windowHeight: (_g = opts.windowHeight) !== null && _g !== void 0 ? _g : defaultView.innerHeight,
                    scrollX: (_h = opts.scrollX) !== null && _h !== void 0 ? _h : defaultView.pageXOffset,
                    scrollY: (_j = opts.scrollY) !== null && _j !== void 0 ? _j : defaultView.pageYOffset,
                };
                windowBounds = new Bounds(windowOptions.scrollX, windowOptions.scrollY, windowOptions.windowWidth, windowOptions.windowHeight);
                context = new Context(contextOptions, windowBounds);
                foreignObjectRendering = (_k = opts.foreignObjectRendering) !== null && _k !== void 0 ? _k : false;
                cloneOptions = {
                    allowTaint: (_l = opts.allowTaint) !== null && _l !== void 0 ? _l : false,
                    onclone: opts.onclone,
                    ignoreElements: opts.ignoreElements,
                    onCopyProperty: opts.onCopyProperty,
                    inlineImages: foreignObjectRendering,
                    copyStyles: foreignObjectRendering,
                };
                context.logger.debug("Starting document clone with size ".concat(windowBounds.width, "x").concat(windowBounds.height, " scrolled to ").concat(-windowBounds.left, ",").concat(-windowBounds.top));
                documentCloner = new DocumentCloner(context, element, cloneOptions);
                clonedElement = documentCloner.clonedReferenceElement;
                if (!clonedElement) {
                    return [2 /*return*/, Promise.reject("Unable to find element in cloned iframe")];
                }
                return [4 /*yield*/, documentCloner.toIFrame(ownerDocument, windowBounds)];
            case 1:
                container = _u.sent();
                _a = isBodyElement(clonedElement) || isHTMLElement(clonedElement)
                    ? parseDocumentSize(clonedElement.ownerDocument)
                    : parseBounds(context, clonedElement), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
                backgroundColor = parseBackgroundColor(context, clonedElement, opts.backgroundColor);
                renderOptions = {
                    canvas: opts.canvas,
                    backgroundColor: backgroundColor,
                    scale: (_o = (_m = opts.scale) !== null && _m !== void 0 ? _m : defaultView.devicePixelRatio) !== null && _o !== void 0 ? _o : 1,
                    x: ((_p = opts.x) !== null && _p !== void 0 ? _p : 0) + left,
                    y: ((_q = opts.y) !== null && _q !== void 0 ? _q : 0) + top,
                    width: (_r = opts.width) !== null && _r !== void 0 ? _r : Math.ceil(width),
                    height: (_s = opts.height) !== null && _s !== void 0 ? _s : Math.ceil(height),
                };
                if (!foreignObjectRendering) return [3 /*break*/, 3];
                context.logger.debug("Document cloned, using foreign object rendering");
                renderer = new ForeignObjectRenderer(context, renderOptions);
                return [4 /*yield*/, renderer.render(clonedElement)];
            case 2:
                canvas = _u.sent();
                return [3 /*break*/, 5];
            case 3:
                context.logger.debug("Document cloned, element located at ".concat(left, ",").concat(top, " with size ").concat(width, "x").concat(height, " using computed rendering"));
                context.logger.debug("Starting DOM parsing");
                root = parseTree(context, clonedElement);
                if (backgroundColor === root.styles.backgroundColor) {
                    root.styles.backgroundColor = COLORS.TRANSPARENT;
                }
                context.logger.debug("Starting renderer for element at ".concat(renderOptions.x, ",").concat(renderOptions.y, " with size ").concat(renderOptions.width, "x").concat(renderOptions.height));
                renderer = new CanvasRenderer(context, renderOptions);
                return [4 /*yield*/, renderer.render(root)];
            case 4:
                canvas = _u.sent();
                _u.label = 5;
            case 5:
                if ((_t = opts.removeContainer) !== null && _t !== void 0 ? _t : true) {
                    if (!DocumentCloner.destroy(ownerDocument, container.id)) {
                        context.logger.error("Cannot detach cloned iframe as it is not in the DOM anymore");
                    }
                }
                context.logger.debug("Finished rendering");
                return [2 /*return*/, canvas];
        }
    });
}); };
var parseBackgroundColor = function (context, element, backgroundColorOverride) {
    var ownerDocument = element.ownerDocument;
    // http://www.w3.org/TR/css3-background/#special-backgrounds
    var documentBackgroundColor = ownerDocument.documentElement
        ? parseColor(context, getComputedStyle(ownerDocument.documentElement).backgroundColor)
        : COLORS.TRANSPARENT;
    var bodyBackgroundColor = ownerDocument.body
        ? parseColor(context, getComputedStyle(ownerDocument.body).backgroundColor)
        : COLORS.TRANSPARENT;
    var defaultBackgroundColor = typeof backgroundColorOverride === 'string'
        ? parseColor(context, backgroundColorOverride)
        : backgroundColorOverride === null
            ? COLORS.TRANSPARENT
            : 0xffffffff;
    return element === ownerDocument.documentElement
        ? isTransparent(documentBackgroundColor)
            ? isTransparent(bodyBackgroundColor)
                ? defaultBackgroundColor
                : bodyBackgroundColor
            : documentBackgroundColor
        : defaultBackgroundColor;
};

export { html2canvas as default };
//# sourceMappingURL=html2canvas.module.js.map
