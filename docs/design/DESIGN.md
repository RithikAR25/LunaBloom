---
name: Sanguine Vitality
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#57423e'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#8b716d'
  outline-variant: '#dec0bb'
  surface-tint: '#a6392c'
  primary: '#550000'
  on-primary: '#ffffff'
  primary-container: '#76160d'
  on-primary-container: '#ff816e'
  inverse-primary: '#ffb4a8'
  secondary: '#855145'
  on-secondary: '#ffffff'
  secondary-container: '#feb9a9'
  on-secondary-container: '#7a473b'
  tertiary: '#2d2520'
  on-tertiary: '#ffffff'
  tertiary-container: '#443a34'
  on-tertiary-container: '#b2a49c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#862217'
  secondary-fixed: '#ffdad3'
  secondary-fixed-dim: '#fbb6a7'
  on-secondary-fixed: '#351008'
  on-secondary-fixed-variant: '#6a3a2f'
  tertiary-fixed: '#f0dfd7'
  tertiary-fixed-dim: '#d3c3bc'
  on-tertiary-fixed: '#221a15'
  on-tertiary-fixed-variant: '#4f453f'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

The brand personality is rooted in empowerment, reliability, and biological intelligence. It shifts away from the industry-standard "pink and floral" cliches, instead embracing a sophisticated, editorial aesthetic that treats menstrual health with the same seriousness as a high-end wellness or finance application. The emotional response should be one of calm control—providing a supportive, non-judgmental space for data entry and health insights.

The design style is **Minimalist with Tactile accents**. It leverages heavy whitespace and a refined typographic hierarchy to make dense physiological data feel breathable. While the core is clean and modern, soft shadows and warm background tones prevent the UI from feeling clinical, ensuring the experience remains intimate and human-centric.

## Colors

The palette is anchored by a deep, authoritative red, used intentionally for primary actions and brand moments. To balance this intensity, the background utilizes warm whites (`#FAF9F6`) rather than pure digital white to reduce eye strain and evoke a "paper-like" quality.

- **Primary (#76160D):** Used for critical data points, active states, and primary CTA buttons.
- **Secondary (#F4B0A1):** A muted coral used for secondary highlights, progress bars, and illustrative accents.
- **Surface (#E8D8D0):** A soft taupe-pink for card backgrounds and container fills to provide subtle contrast against the main background.
- **Semantic Palette:** "Regular" states use a desaturated sage green, and "Ovulation" uses a muted gold, ensuring functional clarity without breaking the sophisticated color harmony.

## Typography

The typographic system pairs the soft, rounded geometry of **Quicksand** for headings with the functional clarity of **Inter** for body text. This combination bridges the gap between approachable warmth and scientific precision.

Headlines use tighter letter-spacing and heavier weights to establish a strong visual anchor. Body text is set with generous line heights to enhance readability during long-form health insight consumption. Labels use a slight tracking increase and uppercase styling to differentiate interactive metadata from static content.

## Layout & Spacing

This design system employs a **Fluid Grid** model with a focus on vertical rhythm. On mobile, the layout relies on a 4-column structure with 20px side margins to ensure content doesn't feel cramped. 

Spacing follows a strict 4px/8px baseline grid. Large "XL" spacing (64px) is used to separate major functional blocks (e.g., the current cycle visualization from the daily log), while smaller "SM" spacing (16px) is reserved for related elements within a card. The philosophy is "Negative Space as Hierarchy"—using distance rather than lines to separate content whenever possible.

## Elevation & Depth

To maintain a clean and modern look, the design system avoids heavy dropshadows. Instead, it uses **Tonal Layers** and **Ambient Depth**:

- **Level 0 (Background):** The warm white base layer.
- **Level 1 (Cards):** Subtle contrast using the tertiary color (#E8D8D0) at low opacity or a 1px border in a slightly darker shade.
- **Level 2 (Active/Floating):** Used for primary buttons and active modals. These utilize a very soft, highly diffused shadow (Blur: 20px, Opacity: 4%) tinted with the primary red to make them feel integrated rather than floating "above" the UI.

Depth is primarily communicated through color shifts rather than physical extrusion.

## Shapes

The shape language is consistently **Rounded**, reflecting the organic nature of the subject matter. 

- **Components:** Standard buttons and input fields use a 0.5rem (8px) radius.
- **Containers:** Large content cards and modals use a 1rem (16px) radius to create a soft, "nested" feel.
- **Data Visualization:** Calendar dots and cycle indicators should use perfect circles to maintain a geometric, clean look. 

Avoid sharp corners entirely to ensure the UI feels safe and welcoming.

## Components

### Buttons
- **Primary:** Solid #76160D with white text. High contrast, 8px rounded corners.
- **Secondary:** Outlined in #76160D or solid tertiary cream with primary red text.
- **States:** Hover/Tap states should involve a subtle darkening of the fill, rather than a color change.

### Cards
Cards are the primary vessel for data. They should have no visible border, using a subtle background fill (Tertiary) to define boundaries. Padding within cards should be a minimum of 24px (MD spacing).

### Input Fields & Controls
- **Form Fields:** Light cream backgrounds with 1px borders in a muted version of the primary color. Labels sit above the field in Inter Bold (Label-MD).
- **Chips/Selectors:** Used for symptom logging. These should be pill-shaped with a 2px stroke when unselected, and a solid desaturated red fill when active.

### Cycle Visualization
A central circular "dial" or "ring" is the hero component. It uses a thick stroke (8px-12px) with gradients between the status colors (Green to Gold) to represent the transition of the cycle phases fluidly rather than abruptly.