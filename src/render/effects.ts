import { CSSFilterList } from '../css/property-descriptors/filter';
import { MIX_BLEND_MODE } from '../css/property-descriptors/mix-blend-mode';
import { Matrix } from '../css/property-descriptors/transform';
import { Path } from './path';

export const enum EffectType {
    TRANSFORM = 0,
    CLIP = 1,
    OPACITY = 2,
    FILTER = 3,
    MIX_BLEND_MODE = 4,
    PATH2D_CLIP = 5,
    /** Overflow clip — same canvas behaviour as CLIP but kept separate so
     *  _computeEffects() can filter overflow clips without discarding clip-path clips. */
    OVERFLOW_CLIP = 6,
}

export const enum EffectTarget {
    BACKGROUND_BORDERS = 1 << 1,
    CONTENT = 1 << 2,
}

export interface IElementEffect {
    readonly type: EffectType;
    readonly target: number;
}

export class TransformEffect implements IElementEffect {
    readonly type: EffectType = EffectType.TRANSFORM;
    readonly target: number = EffectTarget.BACKGROUND_BORDERS | EffectTarget.CONTENT;

    constructor(
        readonly offsetX: number,
        readonly offsetY: number,
        readonly matrix: Matrix,
    ) {}
}

export class ClipEffect implements IElementEffect {
    readonly type: EffectType = EffectType.CLIP;

    constructor(
        readonly path: Path[],
        readonly target: EffectTarget,
        readonly fillRule: CanvasFillRule = 'nonzero',
    ) {}
}

/** Clip produced by overflow:hidden/scroll — distinct from clip-path ClipEffect. */
export class OverflowClipEffect implements IElementEffect {
    readonly type: EffectType = EffectType.OVERFLOW_CLIP;

    constructor(
        readonly path: Path[],
        readonly target: EffectTarget,
    ) {}
}

export class OpacityEffect implements IElementEffect {
    readonly type: EffectType = EffectType.OPACITY;
    readonly target: number = EffectTarget.BACKGROUND_BORDERS | EffectTarget.CONTENT;

    constructor(readonly opacity: number) {}
}

export class FilterEffect implements IElementEffect {
    readonly type: EffectType = EffectType.FILTER;
    readonly target: number = EffectTarget.BACKGROUND_BORDERS | EffectTarget.CONTENT;

    constructor(readonly filter: CSSFilterList) {}
}

export class MixBlendModeEffect implements IElementEffect {
    readonly type: EffectType = EffectType.MIX_BLEND_MODE;
    readonly target: number = EffectTarget.BACKGROUND_BORDERS | EffectTarget.CONTENT;

    constructor(readonly mixBlendMode: MIX_BLEND_MODE) {}
}

export class Path2DClipEffect implements IElementEffect {
    readonly type: EffectType = EffectType.PATH2D_CLIP;

    constructor(
        readonly path2d: Path2D,
        readonly target: EffectTarget,
        readonly fillRule?: CanvasFillRule,
    ) {}
}

export const isTransformEffect = (effect: IElementEffect): effect is TransformEffect =>
    effect.type === EffectType.TRANSFORM;
export const isClipEffect = (effect: IElementEffect): effect is ClipEffect => effect.type === EffectType.CLIP;
export const isOverflowClipEffect = (effect: IElementEffect): effect is OverflowClipEffect =>
    effect.type === EffectType.OVERFLOW_CLIP;
export const isOpacityEffect = (effect: IElementEffect): effect is OpacityEffect => effect.type === EffectType.OPACITY;
export const isFilterEffect = (effect: IElementEffect): effect is FilterEffect => effect.type === EffectType.FILTER;
export const isMixBlendModeEffect = (effect: IElementEffect): effect is MixBlendModeEffect =>
    effect.type === EffectType.MIX_BLEND_MODE;
export const isPath2DClipEffect = (effect: IElementEffect): effect is Path2DClipEffect =>
    effect.type === EffectType.PATH2D_CLIP;
