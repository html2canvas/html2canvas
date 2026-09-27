import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isStringToken } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';

export interface QUOTE {
    open: string;
    close: string;
}

export type Quotes = QUOTE[] | 'none' | null;

export const quotes: IPropertyListDescriptor<Quotes> = {
    name: 'quotes',
    initialValue: 'none',
    prefix: true,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]) => {
        if (tokens.length === 0) {
            return null;
        }

        const first = tokens[0];

        if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
            return 'none';
        }

        if (first.type === TokenType.IDENT_TOKEN && first.value === 'auto') {
            return null;
        }

        const quotes = [];
        const filtered = tokens.filter(isStringToken);

        if (filtered.length % 2 !== 0) {
            return null;
        }

        for (let i = 0; i < filtered.length; i += 2) {
            const open = filtered[i].value;
            const close = filtered[i + 1].value;
            quotes.push({ open, close });
        }

        return quotes;
    },
};

export const getQuote = (quotes: Quotes, depth: number, open: boolean): string => {
    // quotes: none — no quotation marks at all.
    if (quotes === 'none') {
        return '';
    }

    if (!quotes) {
        // When quotes is null (auto or unset), fall back to the default typographic
        // quotation marks. This handles <q> elements where the browser uses
        // locale-dependent quotes via quotes:auto in the user agent stylesheet.
        // Note: browsers use locale-dependent quotes for quotes:auto (e.g. «» for
        // French). We fall back to English-style quotes here. Authors can override
        // this by explicitly setting the quotes property in CSS, e.g.:
        //   q { quotes: '«' '»' '‹' '›'; }
        const defaults: QUOTE[] = [
            { open: '\u201c', close: '\u201d' }, // "" (level 1)
            { open: '\u2018', close: '\u2019' }, // '' (level 2)
        ];
        const q = defaults[Math.min(depth, defaults.length - 1)];
        return q ? (open ? q.open : q.close) : '';
    }

    const quote = quotes[Math.min(depth, quotes.length - 1)];
    if (!quote) {
        return '';
    }

    return open ? quote.open : quote.close;
};
