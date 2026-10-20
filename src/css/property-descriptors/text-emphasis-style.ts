import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';

/**
 * text-emphasis-style
 *
 * Parsed value is the Unicode string of the emphasis mark glyph, or empty
 * string for `none`.
 *
 * getComputedStyle returns compound values like "filled dot", "open circle",
 * which are multiple space-separated tokens.  We must use LIST so
 * parseComponentValues() is called instead of parseComponentValue(), which
 * would throw on the second token.
 *
 * Compound keyword → glyph mapping (fill keyword + shape keyword):
 *   none                  → ''
 *   filled dot / dot      → '•'  U+2022
 *   open dot              → '◦'  U+25E6
 *   filled circle / circle→ '•'  (alias of dot)
 *   open circle           → '◦'
 *   filled double-circle  → '◉'  U+25C9
 *   open double-circle    → '◎'  U+25CE
 *   filled triangle/triangle→ '▲' U+25B2
 *   open triangle         → '△'  U+25B3
 *   filled sesame / sesame→ '﹅'  U+FE45
 *   open sesame           → '﹆'  U+FE46
 *
 * A <string> token is returned as-is (single character, per spec).
 */
export const textEmphasisStyle: IPropertyListDescriptor<string> = {
    name: 'text-emphasis-style',
    initialValue: 'none',
    prefix: false,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): string => {
        // Check for a string token first (custom mark, e.g. text-emphasis-style: '✿')
        for (const token of tokens) {
            if (token.type === TokenType.STRING_TOKEN) {
                return (token as unknown as { value: string }).value;
            }
        }

        // Collect all ident tokens, skip whitespace
        const idents = tokens
            .filter(t => t.type !== TokenType.WHITESPACE_TOKEN && isIdentToken(t))
            .map(t => (t as { value: string }).value.toLowerCase());

        if (idents.length === 0 || idents.includes('none')) return '';

        // Determine fill style (filled / open) and shape
        const isFilled = !idents.includes('open'); // default is filled
        const shape = idents.find(id => id !== 'filled' && id !== 'open') ?? 'circle';

        const key = `${isFilled ? 'filled' : 'open'} ${shape}`;
        switch (key) {
            case 'filled dot':
            case 'filled circle':
                return '\u2022'; // •
            case 'open dot':
            case 'open circle':
                return '\u25E6'; // ◦
            case 'filled double-circle':
                return '\u25C9'; // ◉
            case 'open double-circle':
                return '\u25CE'; // ◎
            case 'filled triangle':
                return '\u25B2'; // ▲
            case 'open triangle':
                return '\u25B3'; // △
            case 'filled sesame':
                return '\uFE45'; // ﹅
            case 'open sesame':
                return '\uFE46'; // ﹆
            default:
                return '\u2022'; // fallback: filled dot
        }
    },
};
