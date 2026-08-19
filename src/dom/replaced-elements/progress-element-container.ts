import {Context} from '../../core/context';
import {ElementContainer} from '../element-container';

export class ProgressElementContainer extends ElementContainer {
    readonly value: number;
    readonly max: number;

    constructor(context: Context, element: HTMLProgressElement) {
        super(context, element);
        this.value = element.value;
        this.max = element.max;
    }

    get ratio(): number {
        return this.max > 0 ? Math.min(this.value / this.max, 1) : 0;
    }
}
