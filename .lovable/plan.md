# Videos browse page + Models page

Two new frontend pages matching the reference screenshots, in Wild Baddies brand style (black background, purple accents, Roboto Condensed uppercase headings).

## Task 1 — `/videos` browse page

Desktop (lg+): two-column layout.
- Left sidebar (sticky, ~260px): "DURATION MINUTES" range control (0, 1, 5, 10, 15, 20, 30+) and a "CATEGORIES" list pulled from the `categories` table with counts.
- Right: centered "VIDEOS" heading, sort row (Most Recent, Most Viewed, Best Rated, Exclusive), then a 2-up video grid using the existing `VideoCard`, then pagination.

Mobile/tablet: no permanent sidebar.
- Heading, then two dropdown filters — "MOST RECENT" and "ANY DURATION".
- Below them, a wrapped row of category chips (`Name count`) straight from the DB, with a "Show More" chip to expand. No "All" chip.
- Video grid goes edge-to-edge, one per row, consistent with the current mobile card treatment.

Pagination: numbered pages with prev/next, page size 24, centered under the grid, above the footer.

SEO handling
- Filters (duration, sort, categories) live in component state only — they never become crawlable URLs or indexable query strings.
- `/videos` gets a self-referencing canonical so no filter combination can spawn duplicate URLs.
- Only page 2+ is reflected in the URL (`?page=2`), with canonical still pointing at `/videos`; category browsing keeps using the existing `/categories/:slug` pages as the crawlable path.

## Task 2 — `/models` page

Display only, no functionality yet.
- Centered "MODELS" heading.
- Desktop: filter row — Model search input (visual only), All Models / Verified / Collab, plus Most Viewed and All Categories dropdowns (static).
- Mobile: the same filters stacked in two centered rows.
- Grid of model cards from the `models` table (`is_active = true`): portrait thumbnail with rounded corners, ranked name line (`#1 Name`), and a muted stat line. 6 columns on desktop, 3 on tablet, 2 on mobile.
- Loading skeletons and an empty state.

## Technical notes

- New `src/lib/models.ts` with `listModels()` querying `models` (id, name, slug, bio, thumbnail_url, is_active, created_at), filtered to active rows, with defensive field mapping like `src/lib/categories.ts`.
- New `src/pages/VideosPage.tsx` and `src/pages/ModelsPage.tsx`; routes added in `App.tsx` above the catch-all.
- New small components: `src/components/videos/VideoFilterSidebar.tsx`, `src/components/videos/MobileVideoFilters.tsx`, `src/components/videos/Pagination.tsx`, `src/components/models/ModelCard.tsx`.
- Video data comes from the existing `list-videos` edge function / `listVideos` helper; duration and category filtering applied client-side over the fetched set for now.
- Both pages use `Header`, `Footer`, `Helmet` metadata, and existing design tokens — no hardcoded color classes.
- Nav links to `/videos` and `/models` added to `DesktopSidebar` and the mobile drawer.