# Figma Dashboard Recreation

A pixel-close recreation of a project research dashboard design (Curator Video Research), built
with React, TypeScript, and hand-written CSS (no UI framework). The source reference image is at
[`design/reference.png`](design/reference.png).

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to `http://localhost:5173`).

## Architectural decisions

**No CSS framework, one CSS file per component.** Each component in `src/components/*` ships
with its own `.css` file, scoped by a BEM-ish class prefix matching the component name (e.g.
`.sidebar`, `.sidebar__item`). Shared values (colors, radii, layout widths) live in
`src/styles/tokens.css` as CSS custom properties, and shared button styles live in
`src/styles/buttons.css` since the same pill/outline/solid buttons are reused across five
different cards (Team, New session, Request More Time, Subscribe, Join, Start...).

**Colors and spacing were sampled from the reference image, not eyeballed.** The design was
supplied as a flat image (no Figma dev-mode link), so exact hex values were pixel-sampled from
the source PNG at its native 7680×4404 resolution (a `PIL`-based sampling script mapped
displayed-image coordinates to source pixels) rather than guessed from the rendered preview.
That produced the token values in `tokens.css` (e.g. the orange accent `#f48322`, the report
card's lavender `#f4f2fe`, the sentiment bar's green/gray/red).

**A single reusable `<Icon>` component**, not per-icon files or an icon font/library dependency.
`components/Icon/Icon.tsx` holds a small map of inline SVG path data (`home`, `calendar`,
`sparkles`, etc.) and renders one `<svg>` with `currentColor` stroke — keeps every icon
consistent in weight/style and trivial to recolor via CSS, with zero extra dependencies.

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
  ActiveTopicsCard/ Topic list sorted by moment count
  ChatPanel/        Right-hand AI assistant chat, sticky on desktop
  Footer/           Copyright/legal links
pages/Dashboard/    Composes all of the above into the full-page layout
```

## Responsive design

Below 1024px, the left sidebar and right chat panel become slide-in drawers (each with its own
close button) instead of squeezing into the layout — triggered by a hamburger button and the
"Chat with AI" button in the top bar respectively, with a shared backdrop overlay that closes
whichever is open. Below 640px, the top bar collapses to icon-only actions and stat/card grids
drop to a single column.

## State management

This app is almost entirely presentational (a static dashboard mockup), so it uses local
`useState` in `Dashboard.tsx` for the two pieces of UI-only state that exist — sidebar drawer
open/closed and chat drawer open/closed — plus a couple of small `useState` calls inside
`Sidebar` (expanded nav section) and `ChatPanel` (message list). Redux Toolkit wasn't justified
here: there's no server data, no cross-cutting state shared by distant components, and no
async flow — reaching for a global store would add indirection without solving a real problem.
If this dashboard grew real data (live session status, actual chat responses from a backend),
Redux Toolkit (or React Query for the server-state slice) would be the natural next step.

## Assumptions & trade-offs

- The design was supplied as a flat image, not a live Figma file, so some values (exact
  font — assumed system/Inter-style sans, since the actual typeface wasn't inspectable) are
  close approximations rather than exact extracted tokens.
- Content below the visible fold in the source screenshot (the tail end of "Active topics") was
  filled in with plausible placeholder data consistent with what's visible elsewhere in the
  design (e.g. the chat panel references "pricing comprehension — 31 moments").
- Icons are custom-drawn inline SVGs approximating the style seen in the reference, not
  extracted assets (none were provided).
- No routing/multi-page navigation was implemented — the nav sidebar is visually complete and
  interactive (expand/collapse) but doesn't navigate anywhere, matching the "recreate this one
  screen" scope of the assessment.
