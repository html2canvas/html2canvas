import { Context } from '../../core/context';
import { ElementContainer } from '../element-container';

export const enum METER_STATE {
    OPTIMUM = 0,
    SUBOPTIMUM = 1,
    CRITICAL = 2,
}

export class MeterElementContainer extends ElementContainer {
    readonly value: number;
    readonly min: number;
    readonly max: number;
    readonly low: number;
    readonly high: number;
    readonly optimum: number;

    constructor(context: Context, element: HTMLMeterElement) {
        super(context, element);
        this.value = element.value;
        this.min = element.min;
        this.max = element.max;
        this.low = element.low;
        this.high = element.high;
        this.optimum = element.optimum;
    }

    get ratio(): number {
        const range = this.max - this.min;
        return range > 0 ? Math.min(Math.max((this.value - this.min) / range, 0), 1) : 0;
    }

    get state(): METER_STATE {
        // Determine the meter state based on CSS meter pseudo-class semantics
        const { value, low, high, optimum } = this;

        // Determine which region the optimum is in
        const optimumInLow = optimum <= low;
        const optimumInHigh = optimum >= high;

        // Determine which region the value is in
        const valueInLow = value <= low;
        const valueInHigh = value >= high;
        const valueInMiddle = value > low && value < high;

        if (optimumInLow) {
            if (valueInLow) return METER_STATE.OPTIMUM;
            if (valueInMiddle) return METER_STATE.SUBOPTIMUM;
            return METER_STATE.CRITICAL;
        }

        if (optimumInHigh) {
            if (valueInHigh) return METER_STATE.OPTIMUM;
            if (valueInMiddle) return METER_STATE.SUBOPTIMUM;
            return METER_STATE.CRITICAL;
        }

        // Optimum is in middle
        if (valueInMiddle || value === low || value === high) return METER_STATE.OPTIMUM;
        return METER_STATE.SUBOPTIMUM;
    }
}
