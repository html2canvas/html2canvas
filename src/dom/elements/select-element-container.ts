import { Context } from '../../core/context';
import { ElementContainer } from '../element-container';

export interface SelectOption {
    text: string;
    selected: boolean;
    /** Native layout of the option relative to the select's border box (px). */
    offsetTop: number;
    offsetHeight: number;
}

export class SelectElementContainer extends ElementContainer {
    /**
     * Text of the currently selected option (single-line dropdown rendering).
     * For a list-box `<select>` this is the first selected option's text.
     */
    readonly value: string;
    /**
     * True when the control renders as a multi-line list box, i.e. `multiple`
     * is set or `size > 1`. Browsers paint these very differently from the
     * single-line closed dropdown.
     */
    readonly isListBox: boolean;
    /** All options in document order, with their selected state (list-box only). */
    readonly options: SelectOption[];
    /**
     * Vertical scroll offset of the list box (px). The browser auto-scrolls the
     * list so the selected option is visible; we capture that offset to
     * reproduce the same visible slice of options.
     */
    readonly scrollTop: number;

    constructor(context: Context, element: HTMLSelectElement) {
        super(context, element);

        // A <select> renders as a multi-line list box when `multiple` is set or
        // its `size` attribute is greater than 1. Otherwise it is the familiar
        // single-line closed dropdown showing the selected option.
        this.isListBox = element.multiple || element.size > 1;

        this.scrollTop = element.scrollTop;

        // Read the native per-option geometry rather than estimating a row
        // height: option box heights differ between engines (e.g. 18px in
        // Chromium vs 26px in Firefox for the same 14px font), and offsetTop
        // already encodes the layout. offsetTop is relative to the select's
        // border box; the renderer subtracts the top border + scrollTop.
        this.options = Array.from(element.options).map(option => ({
            text: option.text || '',
            selected: option.selected,
            offsetTop: (option as HTMLOptionElement).offsetTop,
            offsetHeight: (option as HTMLOptionElement).offsetHeight,
        }));

        const firstSelected = this.options.find(o => o.selected);
        const fallback = element.options[element.selectedIndex || 0];
        this.value = firstSelected ? firstSelected.text : fallback ? fallback.text || '' : '';
    }
}
