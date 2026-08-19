import { SMALL_IMAGE } from '../core/util';
export interface FontMetric {
    baseline: number;
    middle: number;
}

const SAMPLE_TEXT = 'Hidden Text';

export class FontMetrics {
    private readonly _data: {[key: string]: FontMetric};
    private readonly _document: Document;
    private readonly _baselineAdjustment: number;

    constructor(document: Document, baselineAdjustment = 2) {
        this._data = {};
        this._document = document;
        this._baselineAdjustment = baselineAdjustment;
    }

    private parseMetrics(fontFamily: string, fontSize: string): FontMetric {
        const container = this._document.createElement('div');
        const img = this._document.createElement('img');
        const span = this._document.createElement('span');

        const body = this._document.body as HTMLBodyElement;

        container.style.visibility = 'hidden';
        container.style.fontFamily = fontFamily;
        container.style.fontSize = fontSize;
        container.style.margin = '0';
        container.style.padding = '0';
        container.style.whiteSpace = 'nowrap';

        body.appendChild(container);

        img.src = SMALL_IMAGE;
        img.width = 1;
        img.height = 1;

        img.style.margin = '0';
        img.style.padding = '0';
        img.style.verticalAlign = 'baseline';

        span.style.fontFamily = fontFamily;
        span.style.fontSize = fontSize;
        span.style.margin = '0';
        span.style.padding = '0';

        span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
        container.appendChild(span);
        container.appendChild(img);
        const baseline = img.offsetTop - span.offsetTop + this._baselineAdjustment;

        container.removeChild(span);
        container.appendChild(this._document.createTextNode(SAMPLE_TEXT));

        container.style.lineHeight = 'normal';
        img.style.verticalAlign = 'super';

        const middle = img.offsetTop - container.offsetTop + this._baselineAdjustment;

        body.removeChild(container);

        return {baseline, middle};
    }
    getMetrics(fontFamily: string, fontSize: string): FontMetric {
        const key = `${fontFamily} ${fontSize}`;
        if (typeof this._data[key] === 'undefined') {
            this._data[key] = this.parseMetrics(fontFamily, fontSize);
        }

        return this._data[key];
    }

    getRawMetrics(fontFamily: string, fontSize: string): FontMetric {
        const key = `__raw__${fontFamily} ${fontSize}`;
        if (typeof this._data[key] === 'undefined') {
            const container = this._document.createElement('div');
            const img = this._document.createElement('img');
            const span = this._document.createElement('span');
            const body = this._document.body as HTMLBodyElement;

            container.style.visibility = 'hidden';
            container.style.fontFamily = fontFamily;
            container.style.fontSize = fontSize;
            container.style.margin = '0';
            container.style.padding = '0';
            container.style.whiteSpace = 'nowrap';
            body.appendChild(container);

            img.src = SMALL_IMAGE;
            img.width = 1;
            img.height = 1;
            img.style.margin = '0';
            img.style.padding = '0';
            img.style.verticalAlign = 'baseline';

            span.style.fontFamily = fontFamily;
            span.style.fontSize = fontSize;
            span.style.margin = '0';
            span.style.padding = '0';
            span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
            container.appendChild(span);
            container.appendChild(img);
            const baseline = img.offsetTop - span.offsetTop;

            container.removeChild(span);
            container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
            container.style.lineHeight = 'normal';
            img.style.verticalAlign = 'super';
            const middle = img.offsetTop - container.offsetTop;

            body.removeChild(container);
            this._data[key] = {baseline, middle};
        }
        return this._data[key];
    }
}
