import {IPropertyListDescriptor, PropertyDescriptorParsingType} from '../IPropertyDescriptor';
import {CSSValue, isIdentToken} from '../syntax/parser';
import {Context} from '../../core/context';
import {TokenType} from '../syntax/tokenizer';

export const enum BACKGROUND_BLEND_MODE {
    NORMAL = 'source-over',
    MULTIPLY = 'multiply',
    SCREEN = 'screen',
    OVERLAY = 'overlay',
    DARKEN = 'darken',
    LIGHTEN = 'lighten',
    COLOR_DODGE = 'color-dodge',
    COLOR_BURN = 'color-burn',
    HARD_LIGHT = 'hard-light',
    SOFT_LIGHT = 'soft-light',
    DIFFERENCE = 'difference',
    EXCLUSION = 'exclusion',
    HUE = 'hue',
    SATURATION = 'saturation',
    COLOR = 'color',
    LUMINOSITY = 'luminosity'
}

const parseBlendMode = (value: string): BACKGROUND_BLEND_MODE => {
    switch (value) {
        case 'multiply':
            return BACKGROUND_BLEND_MODE.MULTIPLY;
        case 'screen':
            return BACKGROUND_BLEND_MODE.SCREEN;
        case 'overlay':
            return BACKGROUND_BLEND_MODE.OVERLAY;
        case 'darken':
            return BACKGROUND_BLEND_MODE.DARKEN;
        case 'lighten':
            return BACKGROUND_BLEND_MODE.LIGHTEN;
        case 'color-dodge':
            return BACKGROUND_BLEND_MODE.COLOR_DODGE;
        case 'color-burn':
            return BACKGROUND_BLEND_MODE.COLOR_BURN;
        case 'hard-light':
            return BACKGROUND_BLEND_MODE.HARD_LIGHT;
        case 'soft-light':
            return BACKGROUND_BLEND_MODE.SOFT_LIGHT;
        case 'difference':
            return BACKGROUND_BLEND_MODE.DIFFERENCE;
        case 'exclusion':
            return BACKGROUND_BLEND_MODE.EXCLUSION;
        case 'hue':
            return BACKGROUND_BLEND_MODE.HUE;
        case 'saturation':
            return BACKGROUND_BLEND_MODE.SATURATION;
        case 'color':
            return BACKGROUND_BLEND_MODE.COLOR;
        case 'luminosity':
            return BACKGROUND_BLEND_MODE.LUMINOSITY;
        case 'normal':
        default:
            return BACKGROUND_BLEND_MODE.NORMAL;
    }
};

export const backgroundBlendMode: IPropertyListDescriptor<BACKGROUND_BLEND_MODE[]> = {
    name: 'background-blend-mode',
    initialValue: 'normal',
    type: PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (_context: Context, tokens: CSSValue[]): BACKGROUND_BLEND_MODE[] => {
        const modes: BACKGROUND_BLEND_MODE[] = [];
        for (const token of tokens) {
            if (isIdentToken(token)) {
                modes.push(parseBlendMode(token.value));
            } else if (token.type === TokenType.COMMA_TOKEN) {
                // separator between values, skip
            }
        }
        return modes.length ? modes : [BACKGROUND_BLEND_MODE.NORMAL];
    }
};
