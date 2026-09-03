import { Bounds } from '../../css/layout/bounds';

/**
 * Margin (in output pixels) added around the viewport when deciding whether an
 * element can be culled. Absorbs rounding and outset effects such as box
 * shadows and outlines that paint slightly beyond the element's bounds.
 */
export const CULL_MARGIN = 4;

/**
 * Pure geometry test: returns true when `bounds` lies entirely outside the
 * output viewport rect (x, y, width, height), expanded by CULL_MARGIN.
 *
 * All coordinates are in page space (the same space as element bounds).
 */
export const isOutsideViewport = (bounds: Bounds, x: number, y: number, width: number, height: number): boolean => {
    const vpLeft = x - CULL_MARGIN;
    const vpTop = y - CULL_MARGIN;
    const vpRight = x + width + CULL_MARGIN;
    const vpBottom = y + height + CULL_MARGIN;
    return (
        bounds.left > vpRight ||
        bounds.left + bounds.width < vpLeft ||
        bounds.top > vpBottom ||
        bounds.top + bounds.height < vpTop
    );
};
