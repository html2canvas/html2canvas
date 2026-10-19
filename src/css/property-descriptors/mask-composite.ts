import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';

// CSS mask-composite controls how multiple mask layers are combined.
// Maps to Canvas 2D globalCompositeOperation for each layer pair.
export const enum MASK_COMPOSITE {
    ADD = 0,
    SUBTRACT = 1,
    INTERSECT = 2,
    EXCLUDE = 3,
}

export type MaskCompositeList = MASK_COMPOSITE[];

/**
 * Canvas 2D composite operation for each MASK_COMPOSITE value.
 *
 * CSS mask-composite spec: mask-composite[i] defines how layer i (upper)
 * composites with layers below it (lower). In our merge loop (bottom → top),
 * maskCtx is the destination (accumulated lower layers) and layerCanvas is
 * the source (current upper layer).
 *
 * CSS semantics:
 *   add      : upper ∪ lower (both visible)         → source-over
 *   subtract : upper − lower (keep upper, cut lower) → source-out
 *              Canvas source-out = keep source where dest is transparent
 *   intersect: upper ∩ lower (overlap only)          → source-in
 *              Canvas source-in = keep source where dest is opaque
 *   exclude  : (upper ∪ lower) − (upper ∩ lower)    → xor
 */
export const maskCompositeToCanvas: Record<MASK_COMPOSITE, GlobalCompositeOperation> = {
    [MASK_COMPOSITE.ADD]: 'source-over',
    [MASK_COMPOSITE.SUBTRACT]: 'source-out',
    [MASK_COMPOSITE.INTERSECT]: 'source-in',
    [MASK_COMPOSITE.EXCLUDE]: 'xor',
};

export const maskComposite: IPropertyListDescriptor<MaskCompositeList> = {
    name: 'mask-composite',
    initialValue: 'add',
    prefix: false,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): MaskCompositeList => {
        return tokens.map(token => {
            if (isIdentToken(token)) {
                switch (token.value) {
                    case 'subtract':
                        return MASK_COMPOSITE.SUBTRACT;
                    case 'intersect':
                        return MASK_COMPOSITE.INTERSECT;
                    case 'exclude':
                        return MASK_COMPOSITE.EXCLUDE;
                    case 'add':
                    default:
                        return MASK_COMPOSITE.ADD;
                }
            }
            return MASK_COMPOSITE.ADD;
        });
    },
};
