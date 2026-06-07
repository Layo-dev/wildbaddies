## Goal

Recreate the navigation pattern from the reference: a **left-side slide-in sidebar** opened by a **floating circular menu button anchored at the bottom-right** of the viewport. The current right-side `Sheet` and the menu icon in the top header will be replaced.

## Changes (single file: `src/components/Header.tsx`)

### 1. Sheet side: right → left

- Change `<SheetContent side="right" …>` to `side="left"`.
- Keep width `w-[78vw] max-w-[340px]`, black bg, off-white text, glass border on the right edge (`border-r border-foreground/10`).
- Internal structure stays the same (wordmark header, scrollable nav list, legal footer with © line).

### 2. Leave the Nav items the way it is previously 

Reorder/relabel `navItems` to mirror the screenshot:

- Home (Home icon)
- Following (Target icon)
- Saved (Bookmark)
- Reacted (Heart)
- Check Later (Clock)
- Live Cams (Video)
- GFs (Sparkles, or "AI" mark)
- Upload (admin-only, kept)

Active row keeps the glass pill (`bg-foreground/10`) like the "Home" row in the screenshot.

### 3. Remove menu icon from top header

- Drop the `<Menu>` button from the right-side action cluster in the top bar.
- Keep AI / Live Cams / Search / Account icons.

### 4. Add floating menu trigger (bottom-right)

- New `SheetTrigger` rendered as a **fixed circular glass button** at the bottom-right of the viewport:
  - `fixed bottom-5 right-4 z-40`
  - `h-14 w-14 rounded-full grid place-items-center`
  - Uses `.btn-glass` (frosted background, subtle border, blur) to match the new branding
  - Visible on all breakpoints (mobile primary; desktop also gets the floating trigger so behavior is consistent)
  - Icon: `Menu` from lucide (matches the two-line hamburger in the highlighted red box)
  - `aria-label="Open menu"`

### 5. Spacing / alignment polish to match reference

- Drawer header: `px-6 pt-8 pb-6`, wordmark "WILD BADDIES" large/bold (text-3xl).
- Nav rows: `h-14`, `gap-4`, `px-4`, `rounded-2xl`, icon `h-5 w-5`, label `text-base font-medium`. Active row uses `bg-foreground/10`.
- Footer: legal links wrap in two-column-ish flow (`flex flex-wrap gap-x-4 gap-y-2`), uppercase tracking-widest, muted; "© 2026 Wild Baddies." line below in normal-case muted.

## Out of scope

- No changes to routes, AuthContext, AuthModal, SearchBox, FeaturedVideos, VideoCard, design tokens, or any other component.
- Desktop persistent sidebar layout (the drawer is used on both mobile and desktop via the floating trigger).

## Files touched

- `src/components/Header.tsx`