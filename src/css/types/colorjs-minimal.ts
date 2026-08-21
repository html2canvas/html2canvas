/**
 * Minimal colorjs.io setup — only registers the color spaces needed by html2canvas.
 * This avoids bundling all 54 color spaces (~700KB unminified).
 *
 * Registered spaces: sRGB, sRGB-linear, HSL, HWB, Lab, LCH, OKLab, OKLCH,
 * Display P3, Rec.2020, XYZ-D65, XYZ-D50 (needed for gamut mapping and conversions).
 */

// Core Color class without any spaces pre-registered
import Color from 'colorjs.io/src/color.js';

import ColorSpace from 'colorjs.io/src/ColorSpace.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import sRGB from 'colorjs.io/src/spaces/srgb.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import sRGB_Linear from 'colorjs.io/src/spaces/srgb-linear.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import HSL from 'colorjs.io/src/spaces/hsl.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import HWB from 'colorjs.io/src/spaces/hwb.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import Lab from 'colorjs.io/src/spaces/lab.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import LCH from 'colorjs.io/src/spaces/lch.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import OKLab from 'colorjs.io/src/spaces/oklab.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import OKLCH from 'colorjs.io/src/spaces/oklch.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import P3 from 'colorjs.io/src/spaces/p3.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import P3_Linear from 'colorjs.io/src/spaces/p3-linear.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import REC_2020 from 'colorjs.io/src/spaces/rec2020.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import REC_2020_Linear from 'colorjs.io/src/spaces/rec2020-linear.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import XYZ_D65 from 'colorjs.io/src/spaces/xyz-d65.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
import XYZ_D50 from 'colorjs.io/src/spaces/xyz-d50.js';
// @ts-expect-error – colorjs.io does not ship granular type declarations
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
// @ts-expect-error – colorjs.io does not ship granular type declarations
import * as interpolation from 'colorjs.io/src/interpolation.js';
Color.extend(interpolation);

export default Color;
