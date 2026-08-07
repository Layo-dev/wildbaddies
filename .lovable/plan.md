# Tags Page + Tag Multi-Select on Upload

Frontend only. No database changes.

## Task 1 — `/tags` page

A directory of all tags, alphabetically grouped like the reference:

- Page title `TAGS`, centered, uppercase, bold — same display type as other section headings.
- Tags grouped by first character: `#` for tags starting with a digit/symbol, then `A`–`Z`.
- Rendered as a masonry-style multi-column list (CSS columns) so groups flow naturally:
  - mobile: 2 columns, `sm`: 3, `md`: 4, `lg`: 6, `xl`: 9.
- Each group shows a bold letter heading, then its tags stacked underneath as links.
- Tag links point to `/tags/:slug`; if no tag-videos route exists yet, they link to `/search?q=<tag>` so nothing dead-ends.
- Brand styling: black background, off-white text, muted `#B3B3B3` for idle links, purple glow/underline on hover.
- Loading state: skeleton columns. Empty state: "No tags yet." Error state: inline message.
- Route added to `App.tsx`; "Tags" entry added to the desktop sidebar and mobile drawer nav.

## Task 2 — Tags field on Upload page

Replaces nothing existing; sits under the Categories multi-select.

- Text input with autocomplete: typing filters existing tags (debounced, case-insensitive, capped at ~8 suggestions) in a dropdown below the input.
- Click a suggestion or press Enter on the highlighted one to add it.
- Press Enter with no match to add a new free-text tag (marked as "new" in the chip until saved).
- Selected tags render as removable chips above/below the input with an `x` button, matching the chip reference (leading dot, label, close icon), keyboard accessible.
- Backspace on empty input removes the last chip. Duplicates are ignored.
- Inputs disabled during upload; tags reset after a successful upload.

## Technical notes

- New `src/lib/tags.ts`: `listTags()` reads `id, name, slug` from the `tags` table (defensive mapping + slug fallback, mirroring `src/lib/categories.ts`). Both features share this query via a `["tags"]` React Query key.
- New `src/pages/TagsPage.tsx` plus a small `TagChip` / `TagAutocomplete` component under `src/components/tags/`.
- `UploadPage.tsx` gains tag state and passes `tags` (names) + `tagIds` (existing ones) into `uploadVideo`; `uploadVideo` in `src/lib/videos.ts` forwards them in the `get-upload-url` body. Persisting them server-side is a backend change and is out of scope here — the frontend sends the payload only.
