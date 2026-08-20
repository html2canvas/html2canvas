import {Context} from '../../core/context';
import {ElementContainer} from '../element-container';
export class TextareaElementContainer extends ElementContainer {
    readonly value: string;
    readonly scrollTop: number;
    constructor(context: Context, element: HTMLTextAreaElement) {
        super(context, element);
        this.value = element.value;
        this.scrollTop = element.scrollTop;
    }
}
