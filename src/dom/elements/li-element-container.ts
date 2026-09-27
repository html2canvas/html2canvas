import { Context } from '../../core/context';
import { DATA_ATTR_MARKER } from '../clone-attributes';
import { ElementContainer } from '../element-container';
export class LIElementContainer extends ElementContainer {
    readonly value: number;
    /** Serialised ::marker style delta (JSON), or null if default. */
    readonly markerStyles: Record<string, string> | null;

    constructor(context: Context, element: HTMLLIElement) {
        super(context, element);
        this.value = element.value;
        const markerAttr = element.getAttribute(DATA_ATTR_MARKER);
        this.markerStyles = markerAttr ? JSON.parse(markerAttr) : null;
    }
}
