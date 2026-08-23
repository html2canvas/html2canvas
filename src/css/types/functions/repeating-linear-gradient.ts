import { Context } from '../../../core/context';
import { CSSValue, parseFunctionArgs } from '../../syntax/parser';
import { TokenType } from '../../syntax/tokenizer';
import { angle as angleType, deg, isAngle, parseNamedSide } from '../angle';
import { CSSImageType, CSSRepeatingLinearGradientImage, GradientCorner, UnprocessedGradientColorStop } from '../image';
import { parseColorStop } from './gradient';

export const repeatingLinearGradient = (context: Context, tokens: CSSValue[]): CSSRepeatingLinearGradientImage => {
    let angle: number | GradientCorner = deg(180);
    const stops: UnprocessedGradientColorStop[] = [];

    parseFunctionArgs(tokens).forEach((arg, i) => {
        if (i === 0) {
            const firstToken = arg[0];
            if (firstToken.type === TokenType.IDENT_TOKEN && firstToken.value === 'to') {
                angle = parseNamedSide(arg);
                return;
            } else if (isAngle(firstToken)) {
                angle = angleType.parse(context, firstToken);
                return;
            }
        }
        const colorStop = parseColorStop(context, arg);
        stops.push(colorStop);
    });

    return { angle, stops, type: CSSImageType.REPEATING_LINEAR_GRADIENT };
};
