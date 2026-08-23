import { contains } from '../core/bitwise';
import { ClipPathType } from '../css/property-descriptors/clip-path';
import { DISPLAY } from '../css/property-descriptors/display';
import { MIX_BLEND_MODE } from '../css/property-descriptors/mix-blend-mode';
import { OVERFLOW } from '../css/property-descriptors/overflow';
import { POSITION } from '../css/property-descriptors/position';
import { createCounterText } from '../css/types/functions/counter';
import { getAbsoluteValue, getNumber } from '../css/types/length-percentage';
import { ElementContainer, FLAGS } from '../dom/element-container';
import { LIElementContainer } from '../dom/elements/li-element-container';
import { OLElementContainer } from '../dom/elements/ol-element-container';
import { BoundCurves, calculateBorderBoxPath, calculatePaddingBoxPath } from './bound-curves';
import { buildClipPath } from './clip-path-effect';
import {
    ClipEffect,
    EffectTarget,
    FilterEffect,
    IElementEffect,
    isOverflowClipEffect,
    MixBlendModeEffect,
    OpacityEffect,
    OverflowClipEffect,
    Path2DClipEffect,
    TransformEffect,
} from './effects';
import { equalPath } from './path';
import { Vector } from './vector';

export class StackingContext {
    element: ElementPaint;
    negativeZIndex: StackingContext[];
    zeroOrAutoZIndexOrTransformedOrOpacity: StackingContext[];
    positiveZIndex: StackingContext[];
    nonPositionedFloats: StackingContext[];
    nonPositionedInlineLevel: StackingContext[];
    inlineLevel: ElementPaint[];
    nonInlineLevel: ElementPaint[];

    constructor(container: ElementPaint) {
        this.element = container;
        this.inlineLevel = [];
        this.nonInlineLevel = [];
        this.negativeZIndex = [];
        this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
        this.positiveZIndex = [];
        this.nonPositionedFloats = [];
        this.nonPositionedInlineLevel = [];
    }
}

export class ElementPaint {
    readonly effects: IElementEffect[] = [];
    readonly curves: BoundCurves;
    listValue?: string;
    private _collectedEffects: IElementEffect[] | null = null;

    constructor(
        readonly container: ElementContainer,
        readonly parent: ElementPaint | null,
    ) {
        this.curves = new BoundCurves(this.container);
        if (this.container.styles.opacity < 1) {
            this.effects.push(new OpacityEffect(this.container.styles.opacity));
        }

        if (this.container.styles.transform !== null) {
            const offsetX = this.container.bounds.left + getNumber(this.container.styles.transformOrigin[0]);
            const offsetY = this.container.bounds.top + getNumber(this.container.styles.transformOrigin[1]);
            const matrix = this.container.styles.transform;
            this.effects.push(new TransformEffect(offsetX, offsetY, matrix));
        }

        if (this.container.styles.overflowX !== OVERFLOW.VISIBLE) {
            const borderBox = calculateBorderBoxPath(this.curves);
            const paddingBox = calculatePaddingBoxPath(this.curves);

            if (equalPath(borderBox, paddingBox)) {
                this.effects.push(
                    new OverflowClipEffect(borderBox, EffectTarget.BACKGROUND_BORDERS | EffectTarget.CONTENT),
                );
            } else {
                this.effects.push(new OverflowClipEffect(borderBox, EffectTarget.BACKGROUND_BORDERS));
                this.effects.push(new OverflowClipEffect(paddingBox, EffectTarget.CONTENT));
            }
        }

        if (this.container.styles.isFiltered()) {
            this.effects.push(new FilterEffect(this.container.styles.filter));
        }

        // clip: rect() — deprecated property, applies only to absolutely/fixed positioned elements (CSS spec).
        const clipRect = this.container.styles.clip;
        if (
            clipRect !== null &&
            (this.container.styles.position === POSITION.ABSOLUTE || this.container.styles.position === POSITION.FIXED)
        ) {
            const b = this.container.bounds;
            // rect(top, right, bottom, left): all values are offsets from the element's top-left corner.
            const t = getAbsoluteValue(clipRect.top, b.height);
            const r = getAbsoluteValue(clipRect.right, b.width);
            const bo = getAbsoluteValue(clipRect.bottom, b.height);
            const l = getAbsoluteValue(clipRect.left, b.width);
            const rectPath = [
                new Vector(b.left + l, b.top + t),
                new Vector(b.left + r, b.top + t),
                new Vector(b.left + r, b.top + bo),
                new Vector(b.left + l, b.top + bo),
            ];
            this.effects.push(new ClipEffect(rectPath, EffectTarget.BACKGROUND_BORDERS | EffectTarget.CONTENT));
        }

        // clip-path support: inset / circle / ellipse / polygon / path
        if (this.container.styles.clipPath.type !== ClipPathType.NONE) {
            const result = buildClipPath(this.container.styles.clipPath, this.container.bounds);
            if (result !== null) {
                const target = EffectTarget.BACKGROUND_BORDERS | EffectTarget.CONTENT;
                if (result.kind === 'path') {
                    this.effects.push(new ClipEffect(result.paths, target, result.fillRule ?? 'nonzero'));
                } else {
                    this.effects.push(new Path2DClipEffect(result.path2d, target));
                }
            }
        }

        if (this.container.styles.mixBlendMode !== MIX_BLEND_MODE.NORMAL) {
            this.effects.push(new MixBlendModeEffect(this.container.styles.mixBlendMode));
        }
    }

    getEffects(target: EffectTarget): IElementEffect[] {
        if (!this._collectedEffects) {
            this._collectedEffects = this._computeEffects();
        }
        return this._collectedEffects.filter(effect => contains(effect.target, target));
    }

    private _computeEffects(): IElementEffect[] {
        let inFlow = [POSITION.ABSOLUTE, POSITION.FIXED].indexOf(this.container.styles.position) === -1;
        let parent = this.parent;
        const effects = this.effects.slice(0);
        while (parent) {
            // Propagate all parent effects except overflow clips — those are
            // either skipped (out-of-flow) or re-created below so that the
            // correct paddingBox path is used for each positioning context.
            const croplessEffects = parent.effects.filter(effect => !isOverflowClipEffect(effect));
            if (inFlow || parent.container.styles.position !== POSITION.STATIC || !parent.parent) {
                inFlow = [POSITION.ABSOLUTE, POSITION.FIXED].indexOf(parent.container.styles.position) === -1;
                if (parent.container.styles.overflowX !== OVERFLOW.VISIBLE) {
                    const borderBox = calculateBorderBoxPath(parent.curves);
                    const paddingBox = calculatePaddingBoxPath(parent.curves);
                    if (!equalPath(borderBox, paddingBox)) {
                        effects.unshift(
                            new OverflowClipEffect(paddingBox, EffectTarget.BACKGROUND_BORDERS | EffectTarget.CONTENT),
                        );
                    }
                }
            }
            effects.unshift(...croplessEffects);

            parent = parent.parent;
        }

        return effects;
    }
}

const parseStackTree = (
    parent: ElementPaint,
    stackingContext: StackingContext,
    realStackingContext: StackingContext,
    listItems: ElementPaint[],
) => {
    parent.container.elements.forEach(child => {
        const treatAsRealStackingContext = contains(child.flags, FLAGS.CREATES_REAL_STACKING_CONTEXT);
        const createsStackingContext = contains(child.flags, FLAGS.CREATES_STACKING_CONTEXT);
        const paintContainer = new ElementPaint(child, parent);
        if (contains(child.styles.display, DISPLAY.LIST_ITEM)) {
            listItems.push(paintContainer);
        }

        const listOwnerItems = contains(child.flags, FLAGS.IS_LIST_OWNER) ? [] : listItems;

        if (treatAsRealStackingContext || createsStackingContext) {
            const parentStack =
                treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;

            const stack = new StackingContext(paintContainer);

            if (
                child.styles.isPositioned() ||
                child.styles.opacity < 1 ||
                child.styles.isTransformed() ||
                child.styles.isFiltered() ||
                child.styles.mixBlendMode !== MIX_BLEND_MODE.NORMAL
            ) {
                const order = child.styles.zIndex.order;
                if (order < 0) {
                    let index = 0;

                    parentStack.negativeZIndex.some((current, i) => {
                        if (order > current.element.container.styles.zIndex.order) {
                            index = i;
                            return false;
                        } else if (index > 0) {
                            return true;
                        }

                        return false;
                    });
                    parentStack.negativeZIndex.splice(index, 0, stack);
                } else if (order > 0) {
                    let index = 0;
                    parentStack.positiveZIndex.some((current, i) => {
                        if (order >= current.element.container.styles.zIndex.order) {
                            index = i + 1;
                            return false;
                        } else if (index > 0) {
                            return true;
                        }

                        return false;
                    });
                    parentStack.positiveZIndex.splice(index, 0, stack);
                } else {
                    parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
                }
            } else {
                if (child.styles.isFloating()) {
                    parentStack.nonPositionedFloats.push(stack);
                } else {
                    parentStack.nonPositionedInlineLevel.push(stack);
                }
            }

            parseStackTree(
                paintContainer,
                stack,
                treatAsRealStackingContext ? stack : realStackingContext,
                listOwnerItems,
            );
        } else {
            if (child.styles.isInlineLevel()) {
                stackingContext.inlineLevel.push(paintContainer);
            } else {
                stackingContext.nonInlineLevel.push(paintContainer);
            }

            parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
        }

        if (contains(child.flags, FLAGS.IS_LIST_OWNER)) {
            processListItems(child, listOwnerItems);
        }
    });
};

const processListItems = (owner: ElementContainer, elements: ElementPaint[]) => {
    let numbering = owner instanceof OLElementContainer ? owner.start : 1;
    const reversed = owner instanceof OLElementContainer ? owner.reversed : false;
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        if (
            item.container instanceof LIElementContainer &&
            typeof item.container.value === 'number' &&
            item.container.value !== 0
        ) {
            numbering = item.container.value;
        }

        item.listValue = createCounterText(numbering, item.container.styles.listStyleType, true);

        numbering += reversed ? -1 : 1;
    }
};

export const parseStackingContexts = (container: ElementContainer): StackingContext => {
    const paintContainer = new ElementPaint(container, null);
    const root = new StackingContext(paintContainer);
    const listItems: ElementPaint[] = [];
    parseStackTree(paintContainer, root, root, listItems);
    processListItems(paintContainer.container, listItems);
    return root;
};
