import { IPropertyIdentValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { Context } from '../../core/context';

export const enum UNICODE_BIDI {
    NORMAL = 0,
    EMBED = 1,
    ISOLATE = 2,
    BIDI_OVERRIDE = 3,
    ISOLATE_OVERRIDE = 4,
    PLAINTEXT = 5,
}

export const unicodeBidi: IPropertyIdentValueDescriptor<UNICODE_BIDI> = {
    name: 'unicode-bidi',
    initialValue: 'normal',
    prefix: false,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (_context: Context, bidi: string) => {
        switch (bidi) {
            case 'bidi-override':
                return UNICODE_BIDI.BIDI_OVERRIDE;
            case 'isolate-override':
                return UNICODE_BIDI.ISOLATE_OVERRIDE;
            case 'embed':
                return UNICODE_BIDI.EMBED;
            case 'isolate':
                return UNICODE_BIDI.ISOLATE;
            case 'plaintext':
                return UNICODE_BIDI.PLAINTEXT;
            case 'normal':
            default:
                return UNICODE_BIDI.NORMAL;
        }
    },
};
