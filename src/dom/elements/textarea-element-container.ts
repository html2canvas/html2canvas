import { Context } from '../../core/context';
import { DATA_ATTR_PLACEHOLDER_COLOR } from '../clone-attributes';
import { ElementContainer } from '../element-container';
export class TextareaElementContainer extends ElementContainer {
    readonly value: string;
    readonly scrollTop: number;
    /** True when the displayed text is the placeholder, not user input. */
    readonly isPlaceholder: boolean;
    /** Serialised ::placeholder color (CSS string), or null if same as text color. */
    readonly placeholderColor: string | null;
    constructor(context: Context, element: HTMLTextAreaElement) {
        super(context, element);
        this.value = element.value.length === 0 ? element.placeholder || '' : element.value;
        this.isPlaceholder = element.value.length === 0 && (element.placeholder || '').length > 0;
        this.placeholderColor = element.getAttribute(DATA_ATTR_PLACEHOLDER_COLOR) || null;
        this.scrollTop = element.scrollTop;
    }
}
