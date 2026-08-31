/**
 * Data attribute names used to pass pseudo-element style information from
 * the document cloner (which reads getComputedStyle on the original DOM)
 * to the node parser and element containers (which run on the iframe clone).
 *
 * Centralised here to avoid circular imports between document-cloner and
 * the element containers / node-parser.
 */

/** Serialised ::first-line style delta (JSON object of CSS property → value). */
export const DATA_ATTR_FIRST_LINE = 'data-h2c-first-line';

/** Computed ::placeholder color (CSS color string). */
export const DATA_ATTR_PLACEHOLDER = 'data-h2c-placeholder';

/** Serialised ::marker style delta (JSON object of CSS property → value). */
export const DATA_ATTR_MARKER = 'data-h2c-marker';
