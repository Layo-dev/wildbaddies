## Desktop Left Sidebar (hover-to-expand)

Add a persistent left sidebar on desktop (md+) that matches the reference: a narrow icon rail that expands on hover to reveal labels, a wordmark at the top, and legal footer links at the bottom. Mobile keeps the current floating button + Sheet drawer unchanged.

### Behavior
- Desktop (`md:` and up): fixed left rail, `w-16` collapsed → `w-64` on hover, smooth width transition (~200ms).
- Collapsed state: shows only icons centered; wordmark collapses to a small "b" mark (or hidden).
- Hover state: shows full "WILD BADDIES" wordmark, icon + label rows, and legal footer (COPYRIGHT, TAKEDOWN, CONTACT, CREATORS, WEBMASTERS, TERMS, PRIVACY, 2257) + "© 2026 WILD BADDIES." line.
- Active route: glass pill background (`bg-foreground/10`), matching current drawer styling.
- Mobile (`<md`): sidebar hidden; existing floating bottom-right menu button + left Sheet drawer stay as-is.

### Layout impact
- Add `md:pl-16` to the page shell wrapper so main content clears the rail. Simplest place: wrap `<main>` area — but since the app has no shared layout, apply the left padding on `<body>` via a class on the root `<div id="root">` container OR add it in `App.tsx` around `<Routes>`.
- Chosen approach: add a `<div className="md:pl-16">` wrapper inside `App.tsx` around the routed content, and render `<DesktopSidebar />` as a sibling. Header keeps its top position; sidebar overlays to the left of it visually — z-index so sidebar sits above header on hover expansion.

### Structure
```
DesktopSidebar (fixed left-0 top-0 h-screen w-16 hover:w-64, hidden md:flex)
├── Brand row (h-16, wordmark)
├── Nav list (Home, Categories, Saved, Shorts, Profile, Upload*)
│   └── each row: h-12, icon (shrink-0), label (opacity-0 → opacity-100 on parent hover, whitespace-nowrap)
└── Footer (opacity-0 → opacity-100 on hover)
    ├── Legal links (flex-wrap, uppercase tracking-widest text-xs muted)
    └── © line
```

### Files touched
- add `src/components/DesktopSidebar.tsx` — the new hover-expand sidebar
- edit `src/App.tsx` — mount `<DesktopSidebar />` and add `md:pl-16` wrapper around routes
- edit `src/components/Header.tsx` — hide the floating bottom-right menu button on `md:` (mobile-only) so it doesn't conflict with the desktop rail; drawer + trigger remain for mobile

### Out of scope
- No changes to Header top bar contents (search, account, live cams).
- No changes to routes, auth, tokens, or any page content.
- Mobile UX unchanged.
