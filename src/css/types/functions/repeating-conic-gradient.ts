import { CSSValue, isIdentToken, parseFunctionArgs } from '../../syntax/parser';
import { TokenType } from '../../syntax/tokenizer';
import { isAngle, angle as angleType } from '../angle';
import { CSSRepeatingConicGradientImage, CSSImageType, UnprocessedGradientColorStop } from '../image';
import {
    FIFTY_PERCENT,
    HUNDRED_PERCENT,
    isLengthPercentage,
    LengthPercentage,
    ZERO_LENGTH,
} from '../length-percentage';
import { isLength } from '../length';
import { parseColorStop } from './gradient';
import { Context } from '../../../core/context';

export const repeatingConicGradient = (context: Context, tokens: CSSValue[]): CSSRepeatingConicGradientImage => {
    let startAngle = 0;
    const stops: UnprocessedGradientColorStop[] = [];
    const position: LengthPercentage[] = [];

    parseFunctionArgs(tokens).forEach((arg, i) => {
        if (i === 0) {
            let j = 0;
            while (j < arg.length) {
                const token = arg[j];
                if (isIdentToken(token) && token.value === 'from') {
                    j++;
                    if (j < arg.length && isAngle(arg[j])) {
                        startAngle = angleType.parse(context, arg[j]);
                        j++;
                    }
                } else if (isIdentToken(token) && token.value === 'at') {
                    j++;
                    while (j < arg.length) {
                        const posToken = arg[j];
                        if (isIdentToken(posToken)) {
                            switch (posToken.value) {
                                case 'center':
                                    position.push(FIFTY_PERCENT);
                                    break;
                                case 'top':
                                case 'left':
                                    position.push(ZERO_LENGTH);
                                    break;
                                case 'right':
                                case 'bottom':
                                    position.push(HUNDRED_PERCENT);
                                    break;
                            }
                        } else if (isLengthPercentage(posToken) || isLength(posToken)) {
                            position.push(posToken);
                        } else if (posToken.type === TokenType.COMMA_TOKEN) {
                            break;
                        }
                        j++;
                    }
                } else {
                    // No recognised keyword — treat whole first arg as a color stop
                    stops.push(parseColorStop(context, arg));
                    return;
                }
            }
            return;
        }
        stops.push(parseColorStop(context, arg));
    });

    return { startAngle, stops, position, type: CSSImageType.REPEATING_CONIC_GRADIENT };
};
