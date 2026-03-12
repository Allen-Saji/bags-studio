# BagsStudio UI & Style Guide v1

## Goal
Design BagsStudio so it feels natively compatible with the Bags ecosystem while still feeling like a premium creator-focused product.

The UI should inherit from the Bags app's visual language where helpful:
- dark mode first
- high contrast, clean layout
- strong spacing
- premium minimalism
- modern crypto product feel

But BagsStudio should not feel like a copy-paste of the Bags main app.
It should feel like the **creator control room built on top of Bags**.

---

## Design Principle
**Bags app language + creator tooling clarity + premium post-launch control room**

---

## Visual Relationship to Bags

### What to preserve from Bags
- dark-first interface
- minimal, premium surfaces
- strong typography hierarchy
- clean, centered layouts where appropriate
- restrained use of bright accent colors
- product confidence over visual chaos

### What to add for BagsStudio
- more dashboard structure
- more information density in creator views
- clearer status systems
- supporter tiers, rankings, and score visuals
- campaign cards and activation-focused UI

---

## Color System
The system should feel visually native to Bags — black and green, clean and premium.

### Dark Mode (Default)

#### Base Colors
- `bg-primary`: `#000000`
- `bg-surface`: `#0A0A0A`
- `bg-surface-2`: `#111111`
- `bg-elevated`: `#1A1A1A`
- `border-subtle`: `#1F1F1F`
- `border-strong`: `#2A2A2A`

#### Text Colors
- `text-primary`: `#FFFFFF`
- `text-secondary`: `#A1A1A1`
- `text-muted`: `#666666`
- `text-inverse`: `#000000`

#### Accent Colors
- `accent-primary`: `#00E676`
  The signature Bags green. Used for primary CTAs, active states, scores, and brand moments.

- `accent-primary-hover`: `#00C853`
  Darker green for hover/pressed states.

- `accent-primary-muted`: `rgba(0, 230, 118, 0.15)`
  Subtle green tint for backgrounds, badges, and glows.

- `accent-red`: `#FF5252`
  Used for negative movement, errors, and urgency.

- `accent-amber`: `#FFB300`
  Used sparingly for warnings or neutral status.

### Light Mode (Optional)

#### Base Colors
- `bg-primary`: `#FFFFFF`
- `bg-surface`: `#F7F7F7`
- `bg-surface-2`: `#EFEFEF`
- `bg-elevated`: `#FFFFFF`
- `border-subtle`: `#E5E5E5`
- `border-strong`: `#D4D4D4`

#### Text Colors
- `text-primary`: `#0A0A0A`
- `text-secondary`: `#525252`
- `text-muted`: `#A3A3A3`
- `text-inverse`: `#FFFFFF`

#### Accent Colors
- `accent-primary`: `#16A34A`
  Deeper green for readability on light backgrounds.

- `accent-primary-hover`: `#15803D`

- `accent-primary-muted`: `rgba(22, 163, 74, 0.1)`

### Usage Rule
Green is the dominant accent. Keep screens monochromatic — black, white, green.
Use red and amber only for semantic states (errors, warnings). No decorative color variety.

---

## Typography

### Headings
Use bold, modern sans serif styling with compact spacing.
Headlines should feel editorial and product-led, not enterprise.

### Body
Clean sans serif, highly legible, slightly muted in supporting content.

### Data / Score / Ranking
Use mono or semi-mono styling selectively for:
- Conviction Score
- wallet ranks
- campaign stats
- counts and milestone metrics

### Type Tone
- crisp
- controlled
- premium
- not playful
- not finance-bro terminal spam

---

## Core UI Patterns

### 1. Creator Dashboard
The creator dashboard should feel like the main “studio” surface.

#### Layout
- top summary strip
- left main content stack
- right-side insight rail or action rail on desktop
- dense but breathable grid

#### Core modules
- coin overview header
- momentum snapshot cards
- supporter map preview
- active campaigns
- reward sets
- conviction leaderboard

### 2. Supporter Profile / Wallet View
A supporter page should feel status-driven and emotionally rewarding.

#### Show
- Conviction Score
- tier badge
- supporter rank
- campaign eligibility
- recent activity or support streaks

#### Aesthetic
Use larger typography, glowing tier accents, and cleaner card framing than the creator dashboard.
This page should feel a little more social and identity-like.

### 3. Campaign Builder
This should feel structured and easy to complete.

#### UX style
- step-based flow or clean form card stack
- visible reward logic
- visible qualification rules
- preview of supporter eligibility outcome

### 4. Leaderboards
Leaderboards should feel competitive but premium.

#### Include
- rank number
- wallet short label
- tier badge
- conviction score
- support signal chips

Avoid making it look like a cheap arcade table.

---

## Brand Components

### Tier Badges
Supporter tiers should be visually memorable and easy to scan.

Suggested tiers:
- OG
- Active
- Loyal
- Catalyst
- Champion

#### Styling
- compact rounded badge
- subtle border
- tinted surface background
- color-linked to tier prestige

### Score Display
**Conviction Score** should be a core branded visual.

Recommended display styles:
- circular radial score card
- compact horizontal meter
- large numeric readout with supporting label

### Momentum Cards
Cards for growth/momentum should emphasize:
- movement
- status
- health
- campaign progress

Use small sparklines, progress bars, and accent glow sparingly.

---

## Bags-Native Theming Guidance
Since Allen wants the UI aligned with Bags, BagsStudio should visually coexist with the Bags app.

### Do
- stay dark-first
- use restrained premium surfaces
- preserve minimalism
- keep rounded corners consistent with modern crypto UI patterns
- use whitespace intentionally
- let the product feel expensive and calm

### Don't
- introduce loud rainbow gradients everywhere
- make it feel like a gaming UI
- overpack pages with table-heavy clutter
- diverge too hard from Bags' clean dark identity

---

## Landing Page Aesthetic
The landing page should feel more editorial than dashboard-heavy.

### Hero treatment
- large bold headline
- minimal subtext
- one primary CTA
- one secondary CTA
- product screenshot or layered UI panels with soft glow

### Visual motifs
- stacked studio panels
- supporter score cards
- campaign cards
- leaderboard snippets
- subtle motion or glow around active states

---

## Screen List for v1

### Marketing / Landing
1. Landing page hero
2. Feature overview section
3. Product flow section
4. Final CTA section

### Product
1. Coin select / entry screen
2. Creator dashboard
3. Supporter map / leaderboard view
4. Campaign builder
5. Campaign details page
6. Supporter wallet status page
7. Reward eligibility page

---

## Wireframe Notes

### Creator Dashboard Wireframe
Top:
- coin name
- creator identity
- momentum score
- active campaign count

Middle left:
- momentum cards
- active campaigns
- supporter segments

Middle right:
- conviction leaderboard
- recommended next actions

Bottom:
- reward sets
- recent supporter actions

### Supporter Page Wireframe
Top:
- wallet identity
- tier badge
- conviction score

Middle:
- active campaigns
- qualification state
- reward progress

Bottom:
- rank / leaderboard context
- activity summary

---

## Motion Guidance
Motion should be subtle.

Use motion for:
- card hover
- active campaign progress
- score loading states
- soft glow on successful states

Do not use motion that feels noisy, playful, or casino-like.

---

## Product Feel in One Sentence
**BagsStudio should feel like the premium creator dashboard Bags should have shipped for post-launch community growth.**
