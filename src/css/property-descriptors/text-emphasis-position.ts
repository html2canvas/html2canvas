import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';

/**
 * text-emphasis-position
 *
 * Controls where emphasis marks are placed relative to the base text.
 * Stored as a bitmask for fast renderer checks.
 *
 *   Bit 0 (0x1): OVER  (default for horizontal, 0 = UNDER)
 *   Bit 1 (0x2): RIGHT (default for vertical,   0 = LEFT)
 *
 * The CSS value is a space-separated pair of idents, e.g. `over right`,
 * so we must use LIST (not VALUE) to receive all tokens without throwing.
 */
export const enum TEXT_EMPHASIS_POSITION {
    UNDER = 0,
    OVER = 1,
    LEFT = 0,
    RIGHT = 2,
}

export const textEmphasisPosition: IPropertyListDescriptor<number> = {
    name: 'text-emphasis-position',
    initialValue: 'over right',
    prefix: false,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): number => {
        // Filter out whitespace, keep only ident tokens
        const idents = tokens
            .filter(t => t.type !== TokenType.WHITESPACE_TOKEN && isIdentToken(t))
            .map(t => (t as { value: string }).value.toLowerCase());

        let flags = 0;

        for (const id of idents) {
            switch (id) {
                case 'over':
                    flags |= TEXT_EMPHASIS_POSITION.OVER;
                    break;
                case 'under':
                    /* UNDER = 0, no-op */ break;
                case 'right':
                    flags |= TEXT_EMPHASIS_POSITION.RIGHT;
                    break;
                case 'left':
                    /* LEFT = 0, no-op */ break;
            }
        }

        // If neither over nor under was specified, default to OVER
        if (!idents.includes('over') && !idents.includes('under')) {
            flags |= TEXT_EMPHASIS_POSITION.OVER;
        }

        return flags;
    },
};
