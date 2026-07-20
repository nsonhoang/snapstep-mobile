---
name: SnapStep
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bec9c5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#889390'
  outline-variant: '#3e4946'
  surface-tint: '#83d5c7'
  primary: '#8cdecf'
  on-primary: '#003731'
  primary-container: '#70c2b4'
  on-primary-container: '#004f46'
  inverse-primary: '#006b5f'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffc1b1'
  on-tertiary: '#561f11'
  tertiary-container: '#f49e88'
  on-tertiary-container: '#713424'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9ff2e3'
  primary-fixed-dim: '#83d5c7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a2'
  on-tertiary-fixed: '#3a0a02'
  on-tertiary-fixed-variant: '#723525'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 20px
  gutter: 12px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The brand personality is energetic yet focused, capturing the spontaneous nature of Gen Z travel. The design system leverages **Minimalism** infused with **Glassmorphism** to create a premium, high-tech feel that doesn't distract from user-generated content. 

The emotional response should be one of "effortless discovery." By utilizing deep charcoal backgrounds and vibrant neon accents, the UI recedes into the background, allowing full-bleed photography to serve as the primary window into the travel experience. High-contrast typography ensures immediate legibility during rapid scrolling.

## Colors
This design system utilizes a high-contrast dark palette to prioritize visual immersion. 

- **Primary (#70C2B4):** A clean Mint/Neon Green used for calls-to-action, active states, and interactive markers.
- **Surface & Background:** The core screen background uses pure black (#000 / #000000), with elevated surfaces using dark charcoal (#1A1A1A).
- **Glass Layers:** Semi-transparent overlays use a white-tinted blur (10-15% opacity) to create depth over photography.
- **Functional Colors:** Error states should use a vibrant coral to contrast against the mint primary color.

## Typography
The typography system relies exclusively on **Inter** to maintain a systematic, utilitarian aesthetic. 

- **Headlines:** Use tight letter-spacing and heavy weights (700-800) to create a "poster" feel on travel cards.
- **Body:** Standardized at 16px for maximum readability against dark backgrounds.
- **Labels:** Small caps or increased letter-spacing should be used for secondary metadata (e.g., timestamps, location tags) to distinguish them from actionable text.

## Layout & Spacing
The layout follows a **Fluid Grid** model with an emphasis on edge-to-edge content.

- **Mobile:** 4-column grid with 20px outside margins. Content modules (cards) should feel substantial, often spanning the full width of the screen.
- **Desktop:** 12-column grid with a max-width of 1200px, centering the feed to maintain a focused vertical narrative.
- **Photography:** Images should utilize a 4:5 or 9:16 aspect ratio to fill the viewport, reducing "dead space" and emphasizing the immersive nature of travel.

## Elevation & Depth
Depth is created through **Glassmorphism** and **Tonal Layers** rather than traditional shadows.

- **Level 0 (Background):** Deep charcoal (#0D0D0D).
- **Level 1 (Cards/Sheet):** Elevated charcoal (#1A1A1A) with a subtle 1px stroke (#FFFFFF10).
- **Level 2 (Overlays):** Glassmorphic panels with a 20px backdrop blur and 10% white fill. These are used for navigation bars and floating buttons.
- **Interactive Glows:** Avatars and primary action buttons feature a 15px outer glow using the primary mint color at 30% opacity to simulate light emission.

## Shapes
The shape language is friendly and contemporary, using large radii to soften the high-contrast color palette.

- **Primary Containers:** 1rem (16px) corner radius for feed cards and input fields.
- **Large Elements:** 1.5rem (24px) for bottom sheets and large modal containers.
- **Pill Elements:** Buttons and tags use a fully rounded (999px) radius to contrast against the rectangular structure of the grid.

## Components
Consistent component styling reinforces the "SnapStep" identity:

- **Buttons:** The primary 'Snap' button is a large, circular mint-colored floating action button (FAB) with a subtle glow. Secondary buttons use the glassmorphic style with white text.
- **Chips/Tags:** Small pill-shaped containers with a 1px primary-colored stroke, used for location tags (e.g., "Tokyo," "Hiking").
- **Navigation Bar:** A floating glassmorphic bar at the bottom. The center 'Snap' icon is slightly oversized and anchored to the center.
- **Cards:** Full-bleed image containers with a gradient overlay at the bottom (transitioning from transparent to #0D0D0D) to ensure text legibility for location titles and user names.
- **Input Fields:** Minimalist dark fields with primary-colored focus rings. Labels should float or disappear on focus to maintain the clean aesthetic.
- **Interaction Markers:** Avatars feature a 2px mint-colored border when a user has a "live" story or active trip.
