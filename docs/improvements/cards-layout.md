# Card Layout Issues (Build)

Observations from the current Build layout with the Light Editorial styling applied:

- **Uneven card heights**: Mixed post metadata lengths (titles, dates, description length, tag count) lead to staggered bottoms in the grid, causing visual noise and misaligned CTAs.
- **Grid wrap gaps**: On multi-row grids, varying heights plus `auto-fit` create ragged whitespace pockets; the second row starts misaligned when a taller card sits early in the row.
- **CTA drift**: “Read article” links float at different vertical positions because cards rely on natural flow instead of a flex layout that pins the footer area.
- **Tag pill overflow**: Multiple tags per card wrap irregularly, pushing the CTA down and amplifying height variance; longer tags like “performance” add extra line breaks on narrower widths.
- **Date/title collisions**: Right-aligned dates next to long titles can compress copy on smaller columns, causing awkward line breaks and inconsistent typography rhythm.
- **Hover shadow bleed**: Card hover lift + shadow can overlap adjacent cards when grid gaps tighten at certain widths, making overlaps noticeable on light backgrounds.
- **Pagination row spacing**: The pagination bar sits close to the final card row when cards wrap awkwardly, reducing breathing room and making the end of the list feel abrupt.

## Tag alignment plan

- Move tags into a dedicated `tags-row` block at the bottom of the card so every card reserves the same vertical space for taxonomy metadata.
- Make the card body a flex column so the tags block can use `margin-top: auto` and stay pinned regardless of content length elsewhere in the card.
- Clamp the tag container to two lines (`min-height` + `max-height`) with `flex-wrap` so overflow is hidden rather than stretching a single card taller than its siblings.
- Increase grid `grid-auto-rows` and `align-items: stretch` on listing templates so every card column stays perfectly aligned even if the post contains fewer tags.
- Ensure theme toggle works so light/dark tokens apply reliably while validating card contrast in both modes.
- Fix theme script injection (use `set:html`) to avoid runtime `themeScript` reference errors and keep the toggle functional.
- Align Build header branding with Portal style by using a compact badge next to the logo instead of stacked tagline copy.
