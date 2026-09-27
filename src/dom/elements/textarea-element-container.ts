import { Context } from '../../core/context';
import { DATA_ATTR_PLACEHOLDER } from '../clone-attributes';
import { ElementContainer } from '../element-container';
export class TextareaElementContainer extends ElementContainer {
    readonly value: string;
    readonly scrollTop: number;
    /** True when the displayed text is the placeholder, not user input. */
    readonly isPlaceholder: boolean;
    /** Serialised ::placeholder styles (JSON delta), or null if default. */
    readonly placeholderStyles: Record<string, string> | null;
    constructor(context: Context, element: HTMLTextAreaElement) {
        super(context, element);
        this.value = element.value.length === 0 ? element.placeholder || '' : element.value;
        this.isPlaceholder = element.value.length === 0 && (element.placeholder || '').length > 0;
        const phAttr = element.getAttribute(DATA_ATTR_PLACEHOLDER);
        this.placeholderStyles = phAttr ? JSON.parse(phAttr) : null;
        this.scrollTop = element.scrollTop;
    }
}
