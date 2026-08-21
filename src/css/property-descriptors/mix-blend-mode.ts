import {IPropertyIdentValueDescriptor, PropertyDescriptorParsingType} from '../IPropertyDescriptor';

export const enum MIX_BLEND_MODE {
    NORMAL = 0,
    MULTIPLY = 1,
    SCREEN = 2,
    OVERLAY = 3,
    DARKEN = 4,
    LIGHTEN = 5,
    COLOR_DODGE = 6,
    COLOR_BURN = 7,
    HARD_LIGHT = 8,
    SOFT_LIGHT = 9,
    DIFFERENCE = 10,
    EXCLUSION = 11,
    HUE = 12,
    SATURATION = 13,
    COLOR = 14,
    LUMINOSITY = 15
}

export const mixBlendMode: IPropertyIdentValueDescriptor<MIX_BLEND_MODE> = {
    name: 'mix-blend-mode',
    initialValue: 'normal',
    prefix: false,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (_context, mode: string): MIX_BLEND_MODE => {
        switch (mode) {
            case 'multiply':
                return MIX_BLEND_MODE.MULTIPLY;
            case 'screen':
                return MIX_BLEND_MODE.SCREEN;
            case 'overlay':
                return MIX_BLEND_MODE.OVERLAY;
            case 'darken':
                return MIX_BLEND_MODE.DARKEN;
            case 'lighten':
                return MIX_BLEND_MODE.LIGHTEN;
            case 'color-dodge':
                return MIX_BLEND_MODE.COLOR_DODGE;
            case 'color-burn':
                return MIX_BLEND_MODE.COLOR_BURN;
            case 'hard-light':
                return MIX_BLEND_MODE.HARD_LIGHT;
            case 'soft-light':
                return MIX_BLEND_MODE.SOFT_LIGHT;
            case 'difference':
                return MIX_BLEND_MODE.DIFFERENCE;
            case 'exclusion':
                return MIX_BLEND_MODE.EXCLUSION;
            case 'hue':
                return MIX_BLEND_MODE.HUE;
            case 'saturation':
                return MIX_BLEND_MODE.SATURATION;
            case 'color':
                return MIX_BLEND_MODE.COLOR;
            case 'luminosity':
                return MIX_BLEND_MODE.LUMINOSITY;
            case 'normal':
            default:
                return MIX_BLEND_MODE.NORMAL;
        }
    }
};

/** Map enum to the globalCompositeOperation string value */
export const mixBlendModeToComposite: Record<MIX_BLEND_MODE, GlobalCompositeOperation> = {
    [MIX_BLEND_MODE.NORMAL]: 'source-over',
    [MIX_BLEND_MODE.MULTIPLY]: 'multiply',
    [MIX_BLEND_MODE.SCREEN]: 'screen',
    [MIX_BLEND_MODE.OVERLAY]: 'overlay',
    [MIX_BLEND_MODE.DARKEN]: 'darken',
    [MIX_BLEND_MODE.LIGHTEN]: 'lighten',
    [MIX_BLEND_MODE.COLOR_DODGE]: 'color-dodge',
    [MIX_BLEND_MODE.COLOR_BURN]: 'color-burn',
    [MIX_BLEND_MODE.HARD_LIGHT]: 'hard-light',
    [MIX_BLEND_MODE.SOFT_LIGHT]: 'soft-light',
    [MIX_BLEND_MODE.DIFFERENCE]: 'difference',
    [MIX_BLEND_MODE.EXCLUSION]: 'exclusion',
    [MIX_BLEND_MODE.HUE]: 'hue',
    [MIX_BLEND_MODE.SATURATION]: 'saturation',
    [MIX_BLEND_MODE.COLOR]: 'color',
    [MIX_BLEND_MODE.LUMINOSITY]: 'luminosity'
};
