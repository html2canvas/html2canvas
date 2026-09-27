import { Context } from '../../core/context';
import { IPropertyIdentValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';

export const enum IMAGE_RENDERING {
    AUTO = 0,
    PIXELATED = 1,
    CRISP_EDGES = 2,
    SMOOTH = 3,
}

export const imageRendering: IPropertyIdentValueDescriptor<IMAGE_RENDERING> = {
    name: 'image-rendering',
    initialValue: 'auto',
    prefix: false,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (_context: Context, value: string): IMAGE_RENDERING => {
        switch (value) {
            case 'pixelated':
            // Legacy Chromium/WebKit alias that also disables smoothing.
            case '-webkit-optimize-contrast':
                return IMAGE_RENDERING.PIXELATED;
            case 'crisp-edges':
            case '-webkit-crisp-edges':
            case '-moz-crisp-edges':
            case '-o-crisp-edges':
                return IMAGE_RENDERING.CRISP_EDGES;
            case 'smooth':
            case 'high-quality':
                return IMAGE_RENDERING.SMOOTH;
            case 'auto':
            default:
                return IMAGE_RENDERING.AUTO;
        }
    },
};
