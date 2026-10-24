---
name: Postwright Editorial System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d2daeb'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff3ff'
  surface-container: '#e6eeff'
  surface-container-high: '#e1e8f9'
  surface-container-highest: '#dbe3f3'
  on-surface: '#141c28'
  on-surface-variant: '#42474f'
  inverse-surface: '#29313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#72777f'
  outline-variant: '#c2c7d0'
  surface-tint: '#35618d'
  primary: '#00375e'
  on-primary: '#ffffff'
  primary-container: '#1f4e79'
  on-primary-container: '#95bff1'
  inverse-primary: '#a0cafc'
  secondary: '#0f6682'
  on-secondary: '#ffffff'
  secondary-container: '#98defe'
  on-secondary-container: '#07637f'
  tertiary: '#4c2e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6a4300'
  on-tertiary-container: '#e9b268'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#a0cafc'
  on-primary-fixed: '#001d35'
  on-primary-fixed-variant: '#184974'
  secondary-fixed: '#bde9ff'
  secondary-fixed-dim: '#8ad0ef'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#004d64'
  tertiary-fixed: '#ffddb5'
  tertiary-fixed-dim: '#f5bc72'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#643f00'
  background: '#f8f9ff'
  on-background: '#141c28'
  surface-variant: '#dbe3f3'
typography:
  page-title:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  section-title:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-default:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-strong:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  helper-text:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-text:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  preview-headline:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  preview-body:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies a calm, practical, and utilitarian editorial workspace tailored for professional marketing teams and content operators. It strips away decorative distractions in favor of structural clarity, predictable hierarchy, and high-efficiency typography.

Key attributes:
- **Tone:** Authoritative, disciplined, unhurried, and functional.
- **Aesthetic:** Corporate utilitarian with editorial fidelity. The chrome recedes to let structured form inputs and live content previews take precedence.
- **Guiding Rule:** Zero ornamental gradients, zero glassmorphism, and zero neon accents. All labeling uses clean sentence case aligned to a strict horizontal and vertical baseline.

## Colors

The palette is engineered for prolonged editing sessions and visual clarity:

- **Primary Canvas Background (`#F4F6F8`):** A cool, low-strain neutral that frames working panels cleanly without harsh contrast.
- **Surface Layer (`#FFFFFF`):** High-density crisp white reserved for active input cards, toolbars, and preview panes.
- **Ink Primary (`#1C2430`):** High-contrast, neutral charcoal applied to titles, data labels, and primary body text.
- **Ink Secondary (`#5A6676`):** Balanced mid-tone slate for supporting descriptions, field metadata, and secondary icons.
- **Structural Border (`#D5DBE3`):** 1px boundary line used consistently across modules to enforce geometric partition.
- **Tool Accent / Primary Focus (`#1F4E79`):** Steel navy used purposefully for primary actions, focus rings, and selection indicators.
- **Context Preview Color (`#1F6F8B`):** Brand cyan-slate reserved specifically for live client artifacts and contextual preview states.
- **Error / Destructive (`#D32F2F` / `#C62828`):** Crisp editorial crimson for validation flags, error inline messaging, and destructive state confirmations.

## Typography

The type system is separated into two deliberate domains: the operational UI interface and the simulated editorial output.

- **Interface Domain (`IBM Plex Sans`):** Delivers clean tabular qualities, high legibility at micro sizes, and systematic structure. Standard field labels leverage 13px at 600 weight; form inputs and standard descriptions use 14px regular (400 weight).
- **Editorial Preview Domain (`Source Serif 4`):** Employed exclusively within publication preview panes to represent final output fidelity with classical editorial authority.
- **Casing and Alignment:** All headings and field labels must be styled strictly in sentence case. Never use all-caps transformations.

## Layout & Spacing

Layouts adhere to an absolute 8px baseline rhythm configured to maximize density without creating cognitive fatigue:

- **Split Workspace Model:** A two-pane architecture featuring a left-anchored editing rail (fixed at 480px–540px or standard 5-column span) paired with a responsive content preview canvas occupying the remaining viewport.
- **Section Rhythm:** Exactly 24px (`1.5rem`) vertical space separates distinct functional blocks and fieldsets.
- **Component Field Rhythm:** Exactly 12px (`0.75rem`) vertical space separates consecutive form inputs, labels, and related controls.
- **Micro Rhythms:** Internal input padding leverages 8px vertical by 12px horizontal geometry.

## Elevation & Depth

This system intentionally relies on surface boundary lines rather than heavy multidimensional drops:

- **General Planes:** Flat elevation. Visual containers, side rails, table headers, and form groups use crisp 1px borders in `#D5DBE3` against the `#F4F6F8` floor and `#FFFFFF` cards.
- **Document Preview Frame:** The sole instance of shadow elevation in the application is the designated publishing canvas frame, rendered as `0 4px 16px rgba(28, 36, 48, 0.06)`. This subtle lift establishes the document as an exportable artifact distinct from the application tool frame.
- **Interactive Focus:** Focus outlines use a crisp 2px solid `#1F4E79` ring with a 1px offset, eliminating ambiguous blurry glow effects.

## Shapes

The geometric framework balances tight precision with ergonomic ergonomics:

- **Interactive Elements (Inputs, Buttons, Badges, Chips):** Fixed corner radius of 6px (`0.375rem`), conveying sharp, systematic utility.
- **Window Preview Frames & Modals:** Fixed corner radius of 8px (`0.5rem`), slightly softening the outer perimeter of the live publication canvas.
- **Checkboxes & Segment Selectors:** 4px radius for internal toggles and micro selectors.

## Components

- **Buttons:**
  - *Primary:* Solid `#1F4E79` background, white text, 6px border radius, 8px 16px padding, 13px weight 600 sentence-case text. Hover: `#163A5C`. Active: `#102B45`.
  - *Secondary / Outline:* White background, 1px border `#D5DBE3`, `#1C2430` text. Hover: `#F4F6F8` background.
  - *Destructive:* Ghost or borderless with `#D32F2F` text; confirmed state switches to `#D32F2F` solid background with white text.

- **Inputs & Textareas:**
  - Clean `#FFFFFF` fill with 1px solid `#D5DBE3` border and 6px border radius.
  - Text rendered at 14px `#1C2430`. Placeholder in `#5A6676`.
  - Focus state transitions border to `#1F4E79` with a matching 2px outer outline.
  - Invalid state shifts border to `#D32F2F` accompanied by 13px inline error text below the field.

- **Chips & Tags:**
  - Compact height (24px to 28px), 6px border radius, 1px solid `#D5DBE3`, background `#F4F6F8`, label 12px `#5A6676`.
  - Active/Selected state: `#EAF1F7` fill, 1px solid `#1F4E79`, text `#1F4E79`.

- **Checkboxes & Radio Controls:**
  - 16px by 16px square (checkbox) or circle (radio), 1px solid `#D5DBE3`. Checked fill: `#1F4E79` with crisp white check mark icon.

- **Publication Preview Pane:**
  - Encased in a designated presentation frame with an 8px radius, white fill, 1px `#D5DBE3` boundary, and the signature `0 4px 16px rgba(28, 36, 48, 0.06)` shadow.
  - Headline rendered in `Source Serif 4` 28px bold; article body rendered in `Source Serif 4` 16px regular.