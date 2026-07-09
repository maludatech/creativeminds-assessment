# Figma Dashboard Recreation

A pixel-accurate recreation of a project research dashboard design (Curator Video Research), built from a live Figma file, spec by spec, using React, TypeScript and hand-written CSS (no UI framework).

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to `http://localhost:5173`).

## Architectural decisions

**Built directly from Figma inspector values.** Every component was
implemented against exact values supplied from Figma's inspector: widths, heights, padding, colors and font specs, down to sub-pixel precision where given (e.g. `443.00000394014205px` for the chat panel width). Those values are used literally in CSS as it is.

**No CSS framework, one CSS file per component.** Each component in `src/components/*` ships with its own `.css` file, scoped by a BEM-ish class prefix matching the component name (e.g. `.sidebar`, `.sidebar__item`). Shared values (colors, radii, layout widths) live in`src/styles/tokens.css` as CSS custom properties and shared button styles live in `src/styles/buttons.css` since the same pill/outline/solid buttons are reused across five different cards (Team, New session, Request More Time, Subscribe, Join, Start, etc).

**Mostly real exported assets.** Icons that exist as a distinct asset in the design (sidebar nav icons, logo mark, avatar, chat icons, etc, around 20 in total) are real SVG/PNG exports from Figma, used directly via `<img>`. A single reusable `<Icon>` component (`components/Icon/Icon.tsx`) covers a handful of generic icons (chevrons, search, bell, send, etc) that weren't exported individually for this pass; those are hand-drawn inline SVG paths matching the same visual style as the exported set, rendered with `currentColor` stroke so they stay recolorable via CSS.

**Self-hosted fonts**, not a CDN dependency: Poppins, Montserrat, and Google Sans Flex via `@fontsource/*` packages; General Sans (no fontsource package exists for it) was downloaded as a woff2 and self-hosted at `src/assets/fonts/` with a hand-written `@font-face` in `styles/fonts.css`. Consistent with avoiding runtime dependencies on external font/asset CDNs.

**Component breakdown** mirrors the visual sections of the design 1:1:

```
components/
  Sidebar/         Collapsible nav with an expandable Project Management submenu
  TopBar/           Breadcrumb, Chat with AI button, notifications, user menu
  PageHeader/       Study title/date range + Team/New session actions
  StatsGrid/        4-up Sessions/Moments/Topics/Reels stat cards
  ProjectTimeCard/  Hours-spent progress bar + Request/Subscribe actions
  ReportCard/       "Compiling" report status with progress bar
  TodaySessions/    Today's session list with live/upcoming/scheduled states
  CalendarCard/     Mini month calendar with scheduled-day markers
  SentimentCard/    Segmented sentiment bar
  ActiveTopicsCard/ Header only (title/subtitle/link), no placeholder body content
  ChatPanel/        Right-hand AI assistant chat, sticky on desktop
  Footer/           Single centered line, sits outside the white dashboard shell
pages/Dashboard/    Composes all of the above into the full-page layout
```

## Responsive design

Below 1024px, the left sidebar and right chat panel become slide-in drawers (each with its own close button) instead of squeezing into the layout, triggered by a hamburger button and the "Chat with AI" button in the top bar respectively, with a shared backdrop overlay that closes whichever is open. Below 640px, the top bar collapses to icon-only actions and stat/card grids drop to a single column.

`TodaySessions` uses a CSS **container query** (`@container today-sessions (max-width: 480px)`), not a viewport media query, because the card's rendered width depends on the dashboard's own 1-col/2-col breakpoint, which is independent of viewport width, a media query can't express "when this specific card is narrow," only "when the viewport is narrow."

The chat panel's width uses `clamp(320px, 23.07vw, 443px)` rather than a hardcoded `443px`. Figma's spec is exact at their 1920px canvas, but hardcoding it made the panel look
disproportionately large on narrower real-world screens; `clamp()` preserves the exact spec
width at ≥1920px and scales proportionally below that.

Mobile safe-area insets (`env(safe-area-inset-top, 0px)`) are applied to the TopBar, sidebar drawer, and chat panel drawer for notch/status-bar clearance.

## State management

This app is almost entirely presentational (a static dashboard mockup), so it uses local `useState` in `Dashboard.tsx` for the two pieces of UI-only state that exist: sidebar drawer
open/closed and chat drawer open/closed, plus a couple of small `useState` calls inside `Sidebar` (expanded nav section) and `ChatPanel` (message list).

## Assumptions & trade-offs

- No routing/multi-page navigation was implemented: the nav sidebar is visually complete and interactive (expand/collapse) but doesn't navigate anywhere, matching the "recreate this one screen" scope of the assessment.
- The sidebar's expand/collapse chevron does not rotate: two separate icon assets (selected/unselected) are swapped based on state, matching the actual design rather than an animated rotation.
- A couple of button `border-top` specs came through as a color token like `var(--color-black-0, #000000)`. The `-0` in the token name is Figma's naming convention for 0% opacity, so even though the fallback hex is solid black, the border is meant to be fully invisible, not a visible black line. Treated as transparent to match how the design actually looks and flagged as a judgment call rather than assumed silently.
