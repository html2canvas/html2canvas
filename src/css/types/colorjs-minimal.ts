/**
 * Minimal colorjs.io setup — only registers the color spaces needed by html2canvas.
 * This avoids bundling all 54 color spaces (~700KB unminified).
 *
 * Registered spaces: sRGB, sRGB-linear, HSL, HWB, Lab, LCH, OKLab, OKLCH,
 * Display P3, Rec.2020, XYZ-D65, XYZ-D50 (needed for gamut mapping and conversions).
 */

// Core Color class without any spaces pre-registered
// @ts-ignore – colorjs.io does not ship granular type declarations
import Color from 'colorjs.io/src/color.js';

// @ts-ignore
import ColorSpace from 'colorjs.io/src/ColorSpace.js';
// @ts-ignore
import sRGB from 'colorjs.io/src/spaces/srgb.js';
// @ts-ignore
import sRGB_Linear from 'colorjs.io/src/spaces/srgb-linear.js';
// @ts-ignore
import HSL from 'colorjs.io/src/spaces/hsl.js';
// @ts-ignore
import HWB from 'colorjs.io/src/spaces/hwb.js';
// @ts-ignore
import Lab from 'colorjs.io/src/spaces/lab.js';
// @ts-ignore
import LCH from 'colorjs.io/src/spaces/lch.js';
// @ts-ignore
import OKLab from 'colorjs.io/src/spaces/oklab.js';
// @ts-ignore
import OKLCH from 'colorjs.io/src/spaces/oklch.js';
// @ts-ignore
import P3 from 'colorjs.io/src/spaces/p3.js';
// @ts-ignore
import P3_Linear from 'colorjs.io/src/spaces/p3-linear.js';
// @ts-ignore
import REC_2020 from 'colorjs.io/src/spaces/rec2020.js';
// @ts-ignore
import REC_2020_Linear from 'colorjs.io/src/spaces/rec2020-linear.js';
// @ts-ignore
import XYZ_D65 from 'colorjs.io/src/spaces/xyz-d65.js';
// @ts-ignore
import XYZ_D50 from 'colorjs.io/src/spaces/xyz-d50.js';
// @ts-ignore
import Lab_D65 from 'colorjs.io/src/spaces/lab-d65.js';

// Register only the spaces we need
ColorSpace.register(sRGB);
ColorSpace.register(sRGB_Linear);
ColorSpace.register(HSL);
ColorSpace.register(HWB);
ColorSpace.register(Lab);
ColorSpace.register(LCH);
ColorSpace.register(OKLab);
ColorSpace.register(OKLCH);
ColorSpace.register(P3);
ColorSpace.register(P3_Linear);
ColorSpace.register(REC_2020);
ColorSpace.register(REC_2020_Linear);
ColorSpace.register(XYZ_D65);
ColorSpace.register(XYZ_D50);
ColorSpace.register(Lab_D65);

// Extend Color with interpolation (needed for Color.mix in color-mix)
// @ts-ignore
import * as interpolation from 'colorjs.io/src/interpolation.js';
Color.extend(interpolation);

export default Color;
