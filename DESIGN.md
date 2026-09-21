---
name: Infinity Stone
description: Centered geometric typography, graphite atmosphere and photographic depth inspired by the supplied Tura reference.
colors:
  graphite: "#1b1d23"
  paper: "#e2e2df"
  muted: "#afb0b5"
  line: "#ffffff13"
  surround: "#3d3e44"
  button-surface: "#20222a"
  button-text: "#e1e1e3"
  button-hover: "#2c2e36"
  secondary-surface: "#24262d"
  field-line: "#ffffff16"
  placeholder: "#9a9ba5"
  dialog-surface: "#252730"
  focus: "#ddd5bb"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(64px, 8.2vw, 126px)"
    fontWeight: 700
    lineHeight: 0.93
    letterSpacing: "0.035em"
  headline:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(42px, 5vw, 72px)"
    fontWeight: 700
    letterSpacing: "0.1em"
  gallery-title:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(32px, 4vw, 58px)"
    fontWeight: 700
    letterSpacing: "0.09em"
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.9
  navigation:
    fontFamily: "Outfit, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.12em"
  action:
    fontFamily: "Outfit, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.15em"
rounded:
  square: "0"
spacing:
  frame: "28px"
  header-gutter: "48px"
  content-gutter: "75px"
  content-gutter-tablet: "45px"
  content-gutter-mobile: "30px"
  catalogue-column: "30px"
  catalogue-row: "40px"
components:
  button-primary:
    backgroundColor: "{colors.button-surface}"
    textColor: "{colors.button-text}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "16px 27px"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
    textColor: "white"
  button-secondary:
    backgroundColor: "{colors.secondary-surface}"
    textColor: "{colors.button-text}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "16px 27px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "10px 0"
---

# Design System: Infinity Stone

## Overview

**Creative North Star: Graphite atmosphere and centered photographic depth.** The supplied Tura image governs composition as well as palette. This replaces the rejected left-aligned marketing hero and hero stone slabs. The implementation authority is `src/tura.css`, loaded after the base `src/style.css`; the recorded direction is `.impeccable/direction.md`.

The site sits inside a charcoal-gray surround, with soft illumination from the upper left. Centered geometric titles, small navigation and generous empty space establish a quiet hierarchy. The original logo and real contact details remain intact. Local Outfit substitutes for the reference's unavailable Cera CY.

**Key Characteristics:**
- Centered bold titles and widely tracked uppercase details.
- Graphite stages with ambient illumination and a gray outer frame.
- Overlapping photographic panels and recessed, shadowed controls.
- Square geometry, restrained grayscale imagery and responsive depth.

## Colors

Paper is the primary foreground against graphite; muted supports descriptions and metadata. There is no saturated brand accent. Dark button surfaces retain the atmospheric ground, while fine translucent rules define fields and quieter divisions. Public statement sections remain dark. Administrative error and success feedback retain their semantic treatments from the base stylesheet.

## Typography

Outfit regular and bold are served locally from `/assets/outfit-regular.ttf` and `/assets/outfit-bold.ttf`. Headlines and gallery titles are bold, uppercase and positively tracked. Small uppercase navigation and actions contrast with compact regular descriptions. The deliberately restrained type scale reflects the reference.

The centered home title places a widely spaced STONE beneath INFINITY and a tiny two-line subtitle below. Mobile display type uses `clamp(43px, 11.7vw, 80px)`; page titles become (37px), gallery titles (27px), and mobile navigation (13px). Body copy reflows naturally.

## Layout

The outer site frame caps at (1600px). Frame padding reduces to (18px) at tablet widths and (10px) on mobile, increasing to (45px) on very wide screens. The absolute header places the small logo left and discreet navigation right.

The opening viewport is a nearly empty centered title stage, with contact links at lower left and a vertical exploration link at lower right. The following gallery overlaps three photographs: the central panel is closest, while muted side panels remain selectable. Its title overlaps the image bottom, followed by short copy, a recessed action and previous/next controls.

Contact sections place centered details left and a shadowed form right; the standalone contact route repeats this composition. Public route headings are centered. The catalogue uses three columns and landscape (5:4) images. At (700px) and below, catalogue and split sections stack, gallery depth compresses and navigation expands under the header. Administration retains functional layouts and labeled controls.

## Elevation & Depth

**The Atmospheric Depth Rule.** Use shadows to frame the site, separate overlapping photographs and recess controls or the contact form. Ambient radial light belongs to the graphite stage. Avoid bright floating containers.

The gallery's central image is crisp and nearer; side images are darker, slightly blurred and perspective-rotated. Hover lifts the main photograph slightly and increases its brightness. Exact reusable shadows are recorded in the sidecar. The decorative stone form remains on the company page only.

## Shapes

Buttons, fields, image panels and the contact form retain square corners. Fine rules and simple directional icons support the geometric identity. Depth comes from lighting, layering and shadows.

## Components

Buttons use dark surfaces, uppercase tracked labels, small arrows, no border and a minimum height of (44px). Secondary actions use a slightly lighter dark surface. Text links retain fine underlines.

Contact fields are transparent and underlined, with visible labels above. The form prepares an email in the visitor's email application and explains that behavior. The desktop contact navigation link is plain, without an outlined button treatment.

The usability layer in `src/usability.css` keeps mobile input text at 16px, administration icon controls at 44px, and the mobile navigation scrollable within short viewports. Keyboard route changes move focus to the main content; catalogue search/filter results have a contextual screen-reader status. Decorative icons are hidden from assistive technology and contact fields support name/email autofill.

Gallery controls change the featured item; the central photograph links to its catalogue detail. Catalogue filters expose selection state, search remains available, and loading, retry and empty states remain in the gallery region. Mobile navigation and service accordions retain accessible expanded states.

Motion is a finishing layer in `src/motion.css` and `src/motion.jsx`. The home title enters over 420ms with an 8px displacement; public route headings enter over 220ms. No scroll-linked text dimming or image scaling remains. Gallery changes use a directional 220ms crossfade, with a 180ms caption response; interrupted transitions clean up immediately. Control presses use 140ms scale feedback. Mouse-only image hover uses a restrained 220ms transform; touch has no hover movement. The mobile menu opens in 180ms and closes in 130ms, becoming inert immediately when closed. Accordion content enters over 180ms, without animating layout or delaying its state change.

Keyboard actions are immediate. `prefers-reduced-motion` disables CSS motion and programmatic transitions, including those already running when the preference changes. Focus outlines, native scrolling, and content visibility remain independent of animation. Administration stays immediate except for a 200ms pointer-triggered native confirmation-dialog entrance. Cancel focus, Escape dismissal and focus restoration are preserved. The shared easing is `cubic-bezier(.23, 1, .32, 1)`; animation never blocks a control or delays its actual state update.

## Do's and Don'ts

- **Do** preserve the supplied logo, real contact details and local Outfit assets.
- **Do** preserve centered hierarchy, graphite illumination and photographic overlap.
- **Do** retain keyboard focus, reduced-motion behavior and responsive controls.
- **Do** label demonstrative imagery and keep provisional editorial copy clearly provisional.
- **Don't** restore the rejected left-aligned marketing hero or hero stone slabs.
- **Don't** introduce fabricated project provenance, business claims or metrics.
- **Don't** introduce bright card surfaces or rounded panel styling.

## Fixed background — updated reference
The user's Infinity Stone Matéria site (https://infinity-stone-materia.fabiodrbarros.chatgpt.site) supersedes the previous gray surround and sectional illumination. Use a continuous #19191c viewport background, with the reference's static 49-polygon honeycomb geometry in opposite corners (opacity .32, 440px desktop / 300px mobile). src/ambient.css owns this layer. It never scrolls, translates, or animates. Main sections are transparent; native scrolling and existing reduced-motion-aware transitions affect foreground content only. Preserve typography, content, catalogue, and administration.

## Logo typography — visual approximation
The supplied PNG does not identify the original typeface. INFINITY has geometric sans-serif capitals; STONE has squared, spaced forms. Jost is the visual approximation used throughout the interface; Michroma is used for small brand labels. These are not claimed to be the exact original fonts. Both are locally hosted under SIL OFL, with licences in public/assets. The raster logo is preserved.

## White theme — latest user direction
White #fff canvas replaces charcoal. Preserve the supplied logo in its original colours (no inversion, including its animated transfer). Fixed corner honeycombs use black at .12 opacity; phone and email icons are black. Text, menu, form and control colours adapt for contrast on white. Layout, typography and motion remain unchanged. src/light.css owns the palette overrides.
