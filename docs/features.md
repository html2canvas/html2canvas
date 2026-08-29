---
title: 'Features'
description: 'Discover the different features supported by html2canvas'
previousUrl: './configuration'
previousTitle: 'Configuration'
nextUrl: './examples'
nextTitle: 'Examples'
---

Below is a list of all the supported CSS properties and values.

## Properties

- background
    - background-attachment (`scroll`, `fixed`, `local`)
    - background-blend-mode
    - background-clip
    - background-color
    - background-image
        - url()
        - linear-gradient()
        - radial-gradient()
        - repeating-linear-gradient()
        - repeating-radial-gradient()
        - conic-gradient()
        - repeating-conic-gradient()
    - background-origin
    - background-position
    - background-size
- border
    - border-color
    - border-image
        - border-image-source (`url()` and all gradient types)
        - border-image-slice (number, percentage, `fill`)
        - border-image-width (length, number multiplier, percentage, `auto`)
        - border-image-outset (length, number multiplier)
        - border-image-repeat (`stretch`, `repeat`, `round`, `space`)
    - border-radius
    - border-style
    - border-width
- bottom
- box-decoration-break (`slice` and `clone`)
- box-shadow
- box-sizing
- clip
- clip-path
    - inset()
    - circle()
    - ellipse()
    - polygon()
    - path()
- content
- color
- display
- filter
    - blur()
    - brightness()
    - contrast()
    - drop-shadow()
    - grayscale()
    - hue-rotate()
    - invert()
    - opacity()
    - saturate()
    - sepia()
- flex
- float
- font
    - font-family
    - font-size
    - font-style
    - font-variant
    - font-weight
- height
- left
- letter-spacing
- line-break
- list-style
    - list-style-image
    - list-style-position
    - list-style-type
- margin
- max-height
- max-width
- min-height
- min-width
- mix-blend-mode
- object-fit
- object-position
- opacity
- overflow
- overflow-wrap
- padding
- paint-order
- position
- right
- text-align
- text-decoration
    - text-decoration-color
    - text-decoration-line
    - text-decoration-style
    - text-decoration-thickness
    - text-decoration-inset
- text-underline-offset
- text-underline-position
- text-shadow
- text-transform
- top
- transform
    - matrix()
    - matrix3d() (**3D components projected to 2D**)
    - translate()
    - translateX()
    - translateY()
    - translate3d() (**tz ignored**)
    - translateZ() (**no-op in 2D**)
    - scale()
    - scaleX()
    - scaleY()
    - scale3d() (**sz ignored**)
    - scaleZ() (**no-op in 2D**)
    - rotate()
    - rotateZ()
    - rotateX() (**no-op in 2D**)
    - rotateY() (**no-op in 2D**)
    - rotate3d() (**only z-axis rotation maps to 2D**)
    - skew()
    - skewX()
    - skewY()
    - perspective() (**no-op in 2D**)
- visibility
- white-space
- writing-mode (**Limited support**)
- width
- word-break
- word-spacing
- word-wrap
- z-index
- zoom (**accumulated nested zoom supported**)
- -webkit-text-stroke

## Values

- bend-mode
    - multiply
    - screen
    - overlay
    - darken
    - lighten
    - color-dodge
    - color-burn
    - hard-light
    - soft-light
    - difference
    - exclusion
    - hue
    - saturation
    - color
    - luminosity
- color
    - color name
    - hexa
    - rgb()
    - hsl()
    - lch()
    - lab()
    - oklch()
    - oklab()
    - hwb()
    - color()
    - color-mix()

## Unsupported CSS properties

These CSS properties are **NOT** currently supported

- [font-variant-ligatures](https://github.com/niklasvh/html2canvas/pull/1085)
