import { Context } from '../../core/context';
import { IPropertyIdentValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';

/**
 * isolation
 *
 * When set to `isolate`, the element forms a stacking context that scopes
 * all `mix-blend-mode` compositing of its descendants — they blend against
 * the isolated surface rather than the content behind the element.
 *
 * In the renderer this means the element must be rendered into an off-screen
 * canvas (same mechanism as `opacity < 1`), then composited onto the main
 * canvas with the default source-over operation.
 */
export const enum ISOLATION {
    AUTO    = 0,
    ISOLATE = 1,
}

export const isolation: IPropertyIdentValueDescriptor<ISOLATION> = {
    name: 'isolation',
    initialValue: 'auto',
    prefix: false,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (_context: Context, value: string): ISOLATION => {
        return value === 'isolate' ? ISOLATION.ISOLATE : ISOLATION.AUTO;
    },
};
