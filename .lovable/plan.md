## Goal

Rebrand the site to a strict black + off-white palette with glassmorphism surfaces, and redesign the mobile Header + side navigation drawer to match the reference screenshots. Featured Videos categories should render as a single horizontally-scrolling row (matching the chip pill design in the reference).

Scope: mobile-first. Desktop will reuse the same tokens and layout adapts naturally.

---

## Task 1 — Color Rebrand (design tokens only)

Update `src/index.css` and `tailwind.config.ts` so all existing semantic classes (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-secondary`, `text-primary`, etc.) resolve to the new palette. No component-level color swaps required — the whole app re-skins automatically.

New HSL tokens in `:root`:

- `--background: 0 0% 0%`            → #000000 (body, header, video page)
- `--foreground: 60 11% 95%`         → #F5F5F0 (text, icons)
- `--card: 0 0% 0%`                  → black cards
- `--card-foreground: 60 11% 95%`
- `--popover: 0 0% 4%`               → near-black popover surface
- `--popover-foreground: 60 11% 95%`
- `--primary: 60 11% 95%`            → off-white acts as the accent (CTAs render as off-white on black)
- `--primary-foreground: 0 0% 0%`
- `--secondary: 0 0% 8%`             → subtle elevated surface
- `--secondary-foreground: 60 11% 95%`
- `--muted: 0 0% 10%`
- `--muted-foreground: 60 8% 70%`
- `--accent: 60 11% 95%`
- `--border: 60 11% 95% / 0.12` → represented as `60 11% 95%` and consumed via `hsl(var(--border) / 0.15)` where needed; the raw token stays solid off-white and we lower opacity in components
- `--input: 0 0% 10%`
- `--ring: 60 11% 95%`
- `--destructive` left as-is

Gradients & shadows replaced:
- `--gradient-purple` → `linear-gradient(135deg, #F5F5F0, #FFFFFF)` (off-white "premium" surface for chips/avatars)
- `--gradient-header` → `linear-gradient(180deg, #000 0%, #000 100%)` (flat black)
- `--shadow-glow` / `--shadow-glow-soft` → soft off-white glow at low opacity

Glassmorphism utility added in `@layer components` of `index.css`:

```css
.glass {
  background: hsl(60 11% 95% / 0.06);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid hsl(60 11% 95% / 0.12);
}
.glass-strong { /* same but 0.10 bg, 0.18 border */ }
```

Update `.chip` to use glass styling (transparent glass surface, off-white border, off-white text). Update `tailwind.config.ts` `backgroundImage` / `boxShadow` entries to match the new gradients.

No other files are edited for Task 1 — every existing `text-white`, `bg-card`, `bg-primary`, etc. continues to render correctly under the new tokens.

---

## Task 2 — Header & Right Sidebar redesign (mobile-first)

Rewrite `src/components/Header.tsx`:

**Top bar (mobile)**
```text
[ WILD BADDIES logo ]         [AI] [cam] [search-icon] [user-icon] [menu-icon]
```
- Pure black background, no gradient, no border (or a hairline `border-b border-foreground/10`).
- Logo: kept as text wordmark in off-white.
- Right-cluster icons: lucide icons (`Sparkles` for AI, `Video` for cam, `Search`, `User`, `Menu`) — off-white, ~22px, even spacing.
- Search icon opens an expandable inline search row (the current `SearchBox` slides down beneath the bar). The persistent mobile search row is removed in favor of icon-triggered reveal.
- User icon opens the existing account Popover (login/signup or profile/messages/logout) — logic preserved.

**Right-side slide-in drawer (replaces current top slide-down menu)**
- Triggered by the menu icon. Uses shadcn `Sheet` (`side="right"`) for built-in overlay + slide animation.
- Drawer width ~78vw on mobile, max 340px. Black background with subtle glass overlay backdrop.
- Header inside drawer: large "WILD BADDIES" wordmark, top-left.
- Nav list — each row: lucide icon + label, large tap target (h-14), off-white text, rounded-xl. Active row gets a subtle glass pill background (`bg-foreground/10`). Items:
  - Home (`Home`) → `/`
  - Categories (`LayoutGrid`) → `/categories`
  - Search (`Search`) → `/search`
  - Profile (`User`) → `/profile`
  - Upload (`Upload`) → `/upload` (admin only, preserved)
  - Live Cams (`Video`) → `#` placeholder
- Footer inside drawer: small uppercase legal links (Privacy, DMCA, Terms, 2257) wrapped, then `© 2026 WILD BADDIES`.
- Close behavior: clicking a link closes the sheet; outside click / swipe also closes (Sheet defaults).

**Desktop (≥ md)**
- Same top bar; the inline `SearchBox` stays visible in the center as today.
- Menu icon still opens the right drawer (consistent across breakpoints — simpler than maintaining a separate horizontal nav).

No changes to `AuthModal`, `AuthContext`, or route definitions.

---

## Task 3 — Featured Videos categories as a single scrolling row

Edit `src/components/FeaturedVideos.tsx` chip block only:

- Replace `flex flex-wrap justify-center` with a horizontal scroller:
  ```tsx
  <div className="mt-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
    <div className="flex items-center gap-2 w-max">
      {visibleChips.map(...)}
    </div>
  </div>
  ```
- Drop the "Show All Categories" expand toggle — all chips render in the row and the user scrolls horizontally (matches the reference where chips overflow off the right edge).
- Chips reuse the rebranded `.chip` glass style; the active chip uses `bg-foreground text-background border-foreground` for the high-contrast filled look from the screenshot.
- Add a small `.scrollbar-hide` utility in `index.css` (`::-webkit-scrollbar { display: none }` + `scrollbar-width: none`).

---

## Files changed

- `src/index.css` — new tokens, `.glass` utilities, `.chip` restyle, `.scrollbar-hide`
- `tailwind.config.ts` — gradient + shadow values updated
- `src/components/Header.tsx` — full rewrite per above (uses shadcn `Sheet`)
- `src/components/FeaturedVideos.tsx` — chip section converted to horizontal scroll row

No backend, route, or data changes.

---

## Out of scope (call out)

- Right sidebar as a *persistent desktop column* (the reference is a mobile overlay drawer; a persistent desktop sidebar would require restructuring every page layout). If you want a permanent left/right column on desktop, that's a follow-up.
- Restyling VideoCard, video player, footer interiors beyond what the token change gives for free.
- Replacing the "WILD BADDIES" wordmark with a custom logotype.
